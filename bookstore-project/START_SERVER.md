# How to Start the Bookstore Server

## Quick Start

1. **Make sure you're in the project directory:**
   ```bash
   cd /home/yaseen/Bookstore-project/bookstore-project
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **The server will start on port 3002** (default)
   - Access the application at: http://localhost:3002

4. **Important:** After starting the server, you should see:
   ```
   ╔════════════════════════════════════════════╗
   ║     📚 Bookstore Server Started           ║
   ╠════════════════════════════════════════════╣
   ║  🌐 URL: http://localhost:3002            ║
   ╚════════════════════════════════════════════╝
   ```

## Before Starting

Make sure:
- ✅ Database is set up and running (MySQL/MariaDB)
- ✅ Environment variables are configured (if needed)
- ✅ Dependencies are installed: `npm install`

## Troubleshooting

- **Port already in use?** Change the PORT in `.env` file or `server/config/index.js`
- **Database connection errors?** Check your database credentials
- **Module not found?** Run `npm install`

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

