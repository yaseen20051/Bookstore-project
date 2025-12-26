# Bookstore Project

This is a simple bookstore project built with Node.js, Express, and MySQL.

## Features

*   Customer registration and login
*   Admin login
*   Browse and search for books
*   Shopping cart
*   Checkout
*   Order history
*   Admin panel for managing books, orders, and reports

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yaseen-mohammed/Bookstore-project.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root of the project with the following content:
    ```
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=bookstore_db
    SESSION_SECRET=your_session_secret
    ```
4.  **Create the database and tables:**
    *   Connect to your MySQL server and run the `database/schema.sql` file to create the database and tables.
    *   Run the `database/triggers.sql` file to create the database triggers.
    *   Optionally, run the `database/sample_data.sql` file to populate the database with some sample data.

## Running the application

```bash
npm start
```

Or for development with automatic restarts:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
