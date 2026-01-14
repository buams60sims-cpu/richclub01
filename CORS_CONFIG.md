# CORS CONFIGURATION - PRODUCTION READY

## Changes Made

### Backend (server.js)
✅ Removed wildcard `cors()` - UNSAFE  
✅ Added origin whitelist with credentials support  
✅ Development origins auto-added in dev mode  
✅ Production origins: `richclub.in`, `www.richclub.com`

### Frontend (api.js)
✅ Added `withCredentials: true` to axios  
✅ Enables cookies/auth headers in cross-origin requests

## Allowed Origins

### Development
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)
- `http://127.0.0.1:5173`

### Production
- `https://richclub.in`
- `https://www.richclub.com`

## How It Works

### Request Flow
1. Frontend makes request from `richclub.in`
2. Browser sends `Origin: https://richclub.in` header
3. Backend checks if origin is in whitelist
4. If allowed → responds with `Access-Control-Allow-Origin: https://richclub.in`
5. If not allowed → CORS error

### Credentials Support
- `credentials: true` allows cookies/auth headers
- Required for JWT tokens in cookies (if used)
- Required for session-based auth

## Environment Variables

### Backend (.env)
```bash
CLIENT_URL=http://localhost:5173  # Development
CLIENT_URL=https://richclub.in    # Production
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1  # Development
VITE_API_BASE_URL=https://api.richclub.in/api/v1  # Production
```

## Testing CORS

### Test 1: Allowed Origin
```bash
curl -H "Origin: https://richclub.in" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:5000/api/v1/products
```
**Expected:** `Access-Control-Allow-Origin: https://richclub.in`

### Test 2: Blocked Origin
```bash
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:5000/api/v1/products
```
**Expected:** CORS error

### Test 3: Frontend Request
```javascript
// In browser console on richclub.in
fetch('https://api.richclub.in/api/v1/products', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```
**Expected:** Products returned

## Production Deployment

### Update Backend Origins
```javascript
const allowedOrigins = [
    'https://richclub.in',
    'https://www.richclub.com',
    'https://admin.richclub.in'  // If separate admin domain
];
```

### Update Frontend API URL
```bash
# .env.production
VITE_API_BASE_URL=https://api.richclub.in/api/v1
```

## Common Issues

### Issue 1: CORS Error in Production
**Cause:** Frontend domain not in whitelist  
**Fix:** Add domain to `allowedOrigins` array

### Issue 2: Credentials Not Sent
**Cause:** Missing `withCredentials: true`  
**Fix:** Already added to `api.js`

### Issue 3: Preflight Fails
**Cause:** OPTIONS request blocked  
**Fix:** Already handled with `methods` config

## Security Benefits

✅ Prevents unauthorized domains from accessing API  
✅ Protects against CSRF attacks  
✅ Enables secure cookie-based auth  
✅ Whitelisted origins only  
✅ No wildcard exposure  

## Before vs After

### Before (UNSAFE)
```javascript
app.use(cors()); // Allows ANY origin
```

### After (SECURE)
```javascript
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
```

## Verification Checklist

- [x] Wildcard CORS removed
- [x] Origin whitelist configured
- [x] Credentials enabled
- [x] Frontend uses `withCredentials`
- [x] Environment variables set
- [x] Production origins added
- [ ] Test CORS in production
- [ ] Verify cookies work cross-origin
