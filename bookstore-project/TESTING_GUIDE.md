# Testing Guide - Bookstore Application

## How to Run and Test the Application

### Step 1: Start the Server

Open a terminal in the project directory and run:

```bash
cd /home/yaseen/Bookstore-project/bookstore-project
npm start
```

You should see output like:
```
╔════════════════════════════════════════════╗
║     📚 Bookstore Server Started           ║
╠════════════════════════════════════════════╣
║  🌐 URL: http://localhost:3002            ║
╚════════════════════════════════════════════╝
```

**Keep this terminal open!** The server needs to keep running.

### Step 2: Open the Application in Your Browser

1. Open your web browser
2. Go to: **http://localhost:3002**
3. You should see the bookstore homepage

### Step 3: Test the Add to Cart Functionality

1. **Login as a customer:**
   - Click "Login" → "Customer Login"
   - Use test credentials (check database/sample_data.sql for test users)
   - Or register a new account

2. **Browse Books:**
   - You'll be redirected to `/customer/browse.html`
   - Books should load automatically

3. **Add a book to cart:**
   - Click the "Add to Cart" button on any book
   - You should see a success message (toast notification or alert)
   - Check the browser console (F12) for any errors

### Step 4: Check Browser Console for Errors

1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Look for any errors (they will be in red)
4. Look for logs from `addToCart` function:
   - "addToCart called with ISBN: ..."
   - "Sending request to /api/cart/items with body: ..."
   - "Response status: ..."

### Important: Browser Cache

If changes aren't showing:

1. **Hard Refresh:** Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear Cache:** 
   - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Select "Cached images and files"
   - Click "Clear data"

3. **Disable Cache (for development):**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Check "Disable cache" checkbox
   - Keep Developer Tools open

### Common Issues

**Issue: "Nothing happens when clicking Add to Cart"**
- ✅ Check browser console for errors
- ✅ Make sure you're logged in as a customer
- ✅ Check if server is running
- ✅ Check network tab in DevTools to see if request is being sent

**Issue: "Server won't start"**
- Check if port 3002 is already in use
- Check database connection settings
- Run `npm install` to ensure dependencies are installed

**Issue: "Changes not appearing"**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Restart the server (stop with Ctrl+C, then `npm start` again)

### Testing Checklist

- [ ] Server starts without errors
- [ ] Can access http://localhost:3002
- [ ] Can login as customer
- [ ] Books load on browse page
- [ ] Clicking "Add to Cart" shows success message
- [ ] No errors in browser console
- [ ] Cart page shows added items

