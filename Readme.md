# Hotel Booking MCP Server

This project implements a Hotel Booking server using the Model Context Protocol (MCP). It allows clients to interact with a hotel booking system through defined tools, such as searching for hotels, creating bookings, and retrieving hotel details. The server connects to a PostgreSQL database to manage hotel, room, customer, and booking information.

This server can be communicated with via standard input/output (stdio), typically by an MCP client or a compatible AI model.

For more context and a detailed walkthrough, please refer to the [Medium blog post about this repository](https://medium.com/@f.halukkicik/getting-started-with-mcp-building-your-first-hotel-booking-server-for-llms-ba90a436b218).

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [PostgreSQL](https://www.postgresql.org/) (v12 or later recommended)

## Setup

1.  **Clone the repository:**
    If you haven't already, clone the repository to your local machine.
    ```bash
    git clone <repository-url>
    cd <repository-folder-name> # e.g., mcp-hotel-booking
    ```

2.  **Install dependencies:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install
    ```
    This will install the necessary packages defined in [package.json](package.json).

## Database Setup

This project requires a PostgreSQL database. The server connects using credentials and connection details that can be configured via environment variables (see [src/mcp.ts](src/mcp.ts) for defaults).

1.  **Ensure PostgreSQL is running.**
    You need a running PostgreSQL instance.

2.  **Configure Database Connection:**
    The application uses the following environment variables for database connection. You can set these in your shell, for simplicity in this guide, we'll assume you set them in your shell or know how to manage them.
    *   `DB_USER`: PostgreSQL username (defaults to `postgres`)
    *   `DB_HOST`: PostgreSQL host (defaults to `localhost`)
    *   `DB_NAME`: PostgreSQL database name (defaults to `postgres`)
    *   `DB_PASSWORD`: PostgreSQL password (defaults to `password`)
    *   `DB_PORT`: PostgreSQL port (defaults to `5432`)

    For example, to use the default user `postgres` with password `mypassword` for a database named `hotel_db`:
    ```bash
    export DB_USER=postgres
    export DB_PASSWORD=mypassword
    export DB_NAME=hotel_db
    # DB_HOST and DB_PORT can often be left to default if PostgreSQL is running locally on port 5432
    ```
    *Important: Ensure the user and database exist in your PostgreSQL instance. You might need to create them using `psql` or another database tool.*

    Adjust these commands according to your chosen `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

3.  **Initialize the database schema and data:**
    The [setup_mock_db.sql](setup_mock_db.sql) file contains SQL commands to create tables and populate them with initial data. Run this script against your configured database.
    Using `psql`:
    ```bash
    psql -U your_DB_USER -d your_DB_NAME -h your_DB_HOST -p your_DB_PORT -f setup_mock_db.sql
    ```
    You will be prompted for `your_DB_PASSWORD`. For example, if using the defaults and password 'password':
    ```bash
    psql -U postgres -d postgres -f setup_mock_db.sql
    ```

    or you can simply run on a  gui like [dbeaver](https://dbeaver.io/)

## Building the Project

Compile the TypeScript code to JavaScript using the build script defined in [package.json](package.json):
```bash
npm run build
```
This command will:
1.  Run the TypeScript compiler (`tsc`).
2.  Place the output JavaScript files into the `dist` directory.
3.  Make the main output file (`dist/index.js`) executable.

## Running the Application

Once the project is built and the database is set up and configured, you can run the MCP server:
```bash
node dist/index.js
```
You should see a message in your terminal's standard error output:
```
Hotel Booking MCP Server running on stdio
```
The server is now running and listening for MCP requests on its standard input/output. This means it's ready to be integrated with an MCP client.

## MCP Server Tools

The server, as defined in [src/mcp.ts](src/mcp.ts), exposes the following tools:

*   **`execute_sql_query`**:
    *   Description: Execute a SQL query against the PostgreSQL database.
    *   Parameters:
        *   `query` (string): SQL query to execute.
        *   `params` (array, optional): Query parameters for prepared statements.

*   **`search_hotels`**:
    *   Description: Search for hotels based on location, dates, and other criteria.
    *   Parameters:
        *   `location` (string): City or location to search.
        *   `checkIn` (string): Check-in date (YYYY-MM-DD).
        *   `checkOut` (string): Check-out date (YYYY-MM-DD).
        *   `roomType` (enum: "Single", "Double", "Suite"): Type of room.
        *   `minPrice` (number, optional): Minimum price per night.
        *   `maxPrice` (number, optional): Maximum price per night.
        *   `sortBy` (enum: "price", "rating", "name", default: "price"): Sort results by.
        *   `sortOrder` (enum: "asc", "desc", default: "asc"): Sort order.

*   **`create_booking`**:
    *   Description: Create a new hotel booking.
    *   Parameters:
        *   `customerId` (number): Customer ID.
        *   `roomId` (number): Room ID to book.
        *   `checkInDate` (string): Check-in date (YYYY-MM-DD).
        *   `checkOutDate` (string): Check-out date (YYYY-MM-DD).

*   **`get_hotel_details`**:
    *   Description: Get detailed information about a specific hotel including rooms and amenities.
    *   Parameters:
        *   `hotelId` (number): Hotel ID to get details for.

## Development

*   Source code is located in the `src` directory.
*   The main server logic and tool definitions are in [src/mcp.ts](src/mcp.ts).
*   The application entry point is [src/index.ts](src/index.ts).
*   Database schema and initial data are in [setup_mock_db.sql](setup_mock_db.sql).
*   TypeScript configuration is in [tsconfig.json](tsconfig.json).
*   Project dependencies and scripts are in [package.json](package.json).
