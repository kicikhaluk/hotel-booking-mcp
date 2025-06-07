import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Pool } from "pg";

const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
};

const pool = new Pool(dbConfig);

const serverInfo = {
  name: "Hotel Booking MCP Server",
  version: "0.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompt: {},
  },
};

function createServer() {
  const server = new McpServer(serverInfo);
  registerTools(server);
  return server;
}

function registerTools(server: McpServer): void {
  server.tool(
    "execute_sql_query",
    "Execute a SQL query against the PostgreSQL database",
    {
      query: z.string().describe("SQL query to execute"),
      params: z
        .array(z.any())
        .optional()
        .describe("Query parameters for prepared statements"),
    },
    async ({ query, params = [] }) => {
      try {
        const client = await pool.connect();
        const result = await client.query(query, params);
        client.release();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  rows: result.rows,
                  rowCount: result.rowCount,
                  command: result.command,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        console.error("Database query error:", err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Database error: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "search_hotels",
    "Search for hotels based on location, dates, and other criteria",
    {
      location: z.string().describe("City or location to search"),
      checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
      checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
      roomType: z
        .enum(["Single", "Double", "Suite"])
        .describe("Type of room to search"),
      minPrice: z.number().optional().describe("Minimum price per night"),
      maxPrice: z.number().optional().describe("Maximum price per night"),
      sortBy: z
        .enum(["price", "rating", "name"])
        .default("price")
        .describe("Sort results by"),
      sortOrder: z.enum(["asc", "desc"]).default("asc").describe("Sort order"),
    },
    async ({
      location,
      checkIn,
      checkOut,
      roomType,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    }) => {
      try {
        let query = `
          SELECT DISTINCT h.*, 
                 MIN(r.price) as min_price,
                 MAX(r.price) as max_price,
                 COUNT(r.room_id) as available_rooms
          FROM hotels h
          JOIN rooms r ON h.hotel_id = r.hotel_id
          LEFT JOIN bookings b ON r.room_id = b.room_id 
            AND NOT (b.check_out_date <= $3::date OR b.check_in_date >= $2::date)
            AND b.status != 'canceled'
          WHERE h.location ILIKE $1
            AND r.room_type >= $4
            AND b.room_id IS NULL
        `;

        const params: any[] = [`%${location}%`, checkIn, checkOut, roomType];

        if (minPrice) {
          query += ` AND r.price >= $${params.length + 1}`;
          params.push(minPrice);
        }

        if (maxPrice) {
          query += ` AND r.price <= $${params.length + 1}`;
          params.push(maxPrice);
        }

        query += ` GROUP BY h.hotel_id, h.name, h.location, h.star_rating`;

        const orderByMap = {
          price: "min_price",
          rating: "h.star_rating",
          name: "h.name",
        };
        query += ` ORDER BY ${orderByMap[sortBy]} ${sortOrder.toUpperCase()}`;

        const client = await pool.connect();
        const result = await client.query(query, params);
        client.release();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  hotels: result.rows,
                  count: result.rowCount,
                  searchCriteria: {
                    location,
                    checkIn,
                    checkOut,
                    roomType,
                    minPrice,
                    maxPrice,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        console.error("Hotel search error:", err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Hotel search error: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "create_booking",
    "Create a new hotel booking",
    {
      customerId: z.number().describe("Customer ID"),
      roomId: z.number().describe("Room ID to book"),
      checkInDate: z.string().describe("Check-in date (YYYY-MM-DD)"),
      checkOutDate: z.string().describe("Check-out date (YYYY-MM-DD)"),
    },
    async ({ customerId, roomId, checkInDate, checkOutDate }) => {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Check room availability
        const availabilityQuery = `
          SELECT r.*, h.name as hotel_name
          FROM rooms r
          JOIN hotels h ON r.hotel_id = h.hotel_id
          WHERE r.room_id = $1
            AND NOT EXISTS (
              SELECT 1 FROM bookings b 
              WHERE b.room_id = r.room_id 
                AND NOT (b.check_out_date <= $3 OR b.check_in_date >= $2)
                AND b.status != 'canceled'
            )
        `;

        const availabilityResult = await client.query(availabilityQuery, [
          roomId,
          checkInDate,
          checkOutDate,
        ]);

        if (availabilityResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "Room is not available for the selected dates or doesn't meet guest requirements",
              },
            ],
          };
        }

        const room = availabilityResult.rows[0];
        // Calculate total price
        const nights = Math.ceil(
          (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Create booking
        const bookingQuery = `
          INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, status, booking_date)
          VALUES ($1, $2, $3, $4, 'confirmed', NOW())
          RETURNING *
        `;

        const bookingResult = await client.query(bookingQuery, [
          customerId,
          roomId,
          checkInDate,
          checkOutDate,
        ]);

        await client.query("COMMIT");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  booking: bookingResult.rows[0],
                  room: room,
                  message: "Booking created successfully",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Booking creation error:", err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Booking creation error:${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      } finally {
        client.release();
      }
    }
  );

  server.tool(
    "get_hotel_details",
    "Get detailed information about a specific hotel including rooms and amenities",
    {
      hotelId: z.number().describe("Hotel ID to get details for"),
    },
    async ({ hotelId }) => {
      try {
        const client = await pool.connect();

        // Get hotel basic info
        const hotelQuery = `SELECT * FROM hotels WHERE hotel_id = $1`;
        const hotelResult = await client.query(hotelQuery, [hotelId]);

        if (hotelResult.rows.length === 0) {
          client.release();
          return {
            isError: true,
            content: [{ type: "text", text: "Hotel not found" }],
          };
        }

        // Get rooms
        const roomsQuery = `SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY price`;
        const roomsResult = await client.query(roomsQuery, [hotelId]);

        // Get amenities
        const amenitiesQuery = `
          SELECT a.* FROM amenities a
          WHERE a.hotel_id = $1
        `;
        const amenitiesResult = await client.query(amenitiesQuery, [hotelId]);

        client.release();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  hotel: hotelResult.rows[0],
                  rooms: roomsResult.rows,
                  amenities: amenitiesResult.rows,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        console.error("Hotel details error:", err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching hotel details: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
        };
      }
    }
  );
}

export { createServer };
