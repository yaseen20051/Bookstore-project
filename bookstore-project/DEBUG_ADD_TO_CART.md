# Debug Guide: Add to Cart Not Working

## Step-by-Step Debugging

### 1. Open Browser Console (F12)

1. Go to http://localhost:3002/customer/browse.html
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### 2. Check if Function Exists

In the console, type this and press Enter:
```javascript
typeof window.addToCart
```

**Expected:** Should return `"function"`
**If it returns "undefined":** The function isn't being loaded

### 3. Check if Books Are Loaded

In the console, type:
```javascript
document.getElementById('booksList').innerHTML.length
```

Should return a number greater than 0 if books are displayed.

### 4. Test the Function Directly

In the console, try calling it directly with a test ISBN:
```javascript
window.addToCart('978-0133970777')
```

**Watch for:**
- Console logs: "addToCart called with ISBN: ..."
- Network request in Network tab
- Any error messages

### 5. Check Network Tab

1. Go to **Network** tab in Developer Tools
2. Click "Add to Cart" button
3. Look for a request to `/api/cart/items`
4. Check the request:
   - Status code (200 = success, 403 = not logged in, 500 = server error)
   - Request payload (should have `isbn` and `quantity`)
   - Response (should have success message or error)

### 6. Common Issues

**Issue: Function is undefined**
- Solution: Check if customer.js is loaded (Network tab, look for customer.js)
- Check console for JavaScript errors

**Issue: 403 Forbidden**
- Solution: You're not logged in. Login as a customer first.

**Issue: No network request**
- Solution: Button onclick isn't working. Check if button HTML is correct.

**Issue: Request fails with 500**
- Solution: Check server logs in terminal for error details

### 7. Check Server Logs

Look at the terminal where you ran `npm start`. You should see:
- Request logs
- Any error messages
- Database connection issues

### 8. Verify You're Logged In

In console, check:
```javascript
fetch('/api/auth/check', {credentials: 'include'}).then(r => r.json()).then(console.log)
```

Should show `{authenticated: true, user: {...}}` if logged in.

