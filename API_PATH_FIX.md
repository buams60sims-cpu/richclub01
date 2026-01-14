# API PATH FIX - 404 Resolution

## 🔴 ROOT CAUSE

The frontend was calling `/home-content` **WITHOUT** the `/api` prefix, causing 404 errors in production.

### The Problem Chain:
1. **Frontend base URL was**: `https://api.richclub.in/api/v1` (wrong domain + wrong path)
2. **Frontend API calls**: `api.get('/home-content')`
3. **Resolved to**: `https://api.richclub.in/api/v1/home-content` ❌
4. **Backend actually exposes**: `https://richclub01.onrender.com/api/home-content` ✅

### Why It Failed:
- Wrong domain: `api.richclub.in` doesn't exist
- Wrong path structure: Backend uses `/api/home-content`, not `/api/v1/home-content`
- Vercel was trying to serve `https://richclub01.com/home-content` as a frontend route → 404

---

## ✅ FIXES APPLIED

### 1. Updated Production Environment Variable
**File**: `client/.env.production`

```diff
- VITE_API_BASE_URL=https://api.richclub.in/api/v1
+ VITE_API_BASE_URL=https://richclub01.onrender.com/api
```

### 2. Removed Hardcoded Fallbacks
**File**: `client/src/pages/admin/AdminHomeContent.jsx`

```diff
- const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
+ const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

This ensures the app **fails fast** if the environment variable is missing, rather than silently using wrong URLs.

---

## 🎯 CORRECT CONFIGURATION

### Backend Routes (server/server.js)
```javascript
// LEGACY ROUTES (Line 72-81)
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/home-content', require('./routes/homeContentRoutes'));
// ... etc
```

### Frontend API Configuration (client/src/utils/api.js)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Production: https://richclub01.onrender.com/api
```

### Frontend API Calls (client/src/services/apiService.js)
```javascript
export const getHomeContent = () => {
    return api.get('/home-content');
};
```

### Resolution Chain ✅
```
api.get('/home-content')
↓
baseURL: https://richclub01.onrender.com/api
↓
Final URL: https://richclub01.onrender.com/api/home-content
↓
Backend route: /api/home-content ✅ MATCH!
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Rebuild Frontend with Correct Environment
```bash
cd client
npm run build
```

### 2. Set Environment Variable in Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables

```
Name: VITE_API_BASE_URL
Value: https://richclub01.onrender.com/api
Environment: Production
```

### 3. Redeploy on Vercel
```bash
# Option 1: Trigger redeploy from Vercel dashboard
# Option 2: Push to main branch (if auto-deploy is enabled)
git add .
git commit -m "fix: correct API base URL for production"
git push origin main
```

### 4. Verify the Fix
After deployment, check:
1. Open browser DevTools → Network tab
2. Visit `https://richclub01.com`
3. Look for XHR request to `home-content`
4. Should show: `https://richclub01.onrender.com/api/home-content` with status 200 ✅

---

## 📋 VERIFICATION CHECKLIST

- [x] `.env.production` updated with correct backend URL
- [x] Removed hardcoded localhost fallbacks in `AdminHomeContent.jsx`
- [x] Backend exposes `/api/home-content` route
- [x] Frontend calls match backend routes
- [ ] **TODO**: Set `VITE_API_BASE_URL` in Vercel dashboard
- [ ] **TODO**: Rebuild and redeploy frontend
- [ ] **TODO**: Test in production

---

## 🔍 HOW TO DEBUG IN FUTURE

### Check What URL Frontend Is Using:
```javascript
// In browser console on production site:
console.log(import.meta.env.VITE_API_BASE_URL);
// Should show: https://richclub01.onrender.com/api
```

### Check Network Requests:
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look at the full URL being called
4. Compare with backend routes in `server/server.js`

### Common Mistakes to Avoid:
❌ Using different domains for frontend and backend without CORS
❌ Hardcoding `localhost` fallbacks in production code
❌ Mixing `/api/v1` and `/api` paths inconsistently
❌ Not setting environment variables in deployment platform

---

## 📝 NOTES

- Backend supports **both** `/api/v1/*` (versioned) and `/api/*` (legacy) routes
- Frontend currently uses **legacy** routes (`/api/*`)
- To migrate to versioned routes, update `VITE_API_BASE_URL` to include `/v1`
- All API calls in `apiService.js` are relative paths (no leading domain)
- The `api.js` axios instance handles base URL + auth token automatically
