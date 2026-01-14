# 🔥 HARD RESET DEPLOYMENT PLAN - EXECUTION CHECKLIST

## ✅ PHASE 0 — TRUTH ACCEPTED

**Current State Analysis:**
- ✅ Backend deployed on Render: `https://richclub01.onrender.com`
- ✅ Frontend deployed on Vercel: `https://richclub01.com`
- ❌ Configuration mismatch causing 404 errors
- ✅ This is a **configuration + routing issue**, NOT a code bug

---

## ✅ PHASE 1 — BACKEND (Render) VERIFICATION

### 1️⃣ Backend Folder Structure ✅
```
server/
 ├─ server.js          ← Entry file ✅
 ├─ routes/            ← Route handlers ✅
 ├─ controllers/       ← Business logic ✅
 ├─ models/            ← MongoDB schemas ✅
 ├─ middlewares/       ← Auth, validation ✅
 ├─ package.json       ← Dependencies ✅
```

### 2️⃣ package.json Configuration ✅
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```
**Status**: ✅ Correct (no "type": "module" needed - using CommonJS)

### 3️⃣ Backend Routes Configuration ✅

**VERSIONED ROUTES** (Lines 58-66):
```javascript
app.use('/api/v1/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/coupons', checkoutLimiter, require('./routes/couponRoutes'));
app.use('/api/v1/orders', checkoutLimiter, require('./routes/orderRoutes'));
app.use('/api/v1/payments', checkoutLimiter, require('./routes/paymentRoutes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/adminRoutes'));
app.use('/api/v1/upload', uploadLimiter, require('./routes/uploadRoutes'));
app.use('/api/v1/home-content', require('./routes/homeContentRoutes'));
app.use('/api/v1/health', require('./routes/healthRoutes'));
```

**LEGACY ROUTES** (Lines 69-77) - For backward compatibility:
```javascript
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
// ... etc
```

**Status**: ✅ Both versioned and legacy routes exist

### 4️⃣ Backend Environment Variables (Render)

**File**: `server/.env.production`

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/richclub
JWT_SECRET=GENERATE_NEW_STRONG_SECRET_HERE_MIN_32_CHARS
CLIENT_URL=https://richclub01.com
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=live_secret_xxx
WHATSAPP_DAILY_SUMMARY=916362145668
```

**Status**: ✅ Correct structure

**⚠️ ACTION REQUIRED ON RENDER:**
1. Go to Render Dashboard → `richclub01` service
2. Go to **Environment** tab
3. Verify these variables are set:
   - `NODE_ENV=production`
   - `MONGO_URI=<your-actual-mongo-uri>`
   - `JWT_SECRET=<your-actual-secret>`
   - `CLIENT_URL=https://richclub01.com` (NO /api or /v1)
   - `RAZORPAY_KEY_ID=<your-key>`
   - `RAZORPAY_KEY_SECRET=<your-secret>`

### 5️⃣ Backend CORS Configuration ✅

**File**: `server/server.js` (Line 22-25)

```javascript
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://richclub01.com',
    credentials: true
}));
```

**Status**: ✅ Correct - uses `CLIENT_URL` from environment

**⚠️ IMPORTANT**: 
- If you have multiple frontend URLs (e.g., Vercel preview URLs), update to:
```javascript
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'https://richclub01.com',
        'https://www.richclub01.com',
        'https://richclub02.vercel.app'
    ],
    credentials: true
}));
```

### 6️⃣ Backend Health Check Test

**⚠️ ACTION REQUIRED:**

Test this URL in your browser:
```
https://richclub01.onrender.com/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T...",
  "database": "connected"
}
```

**If this fails** → Backend is broken, fix before proceeding
**If this works** → Backend is DONE ✅

---

## ✅ PHASE 2 — FRONTEND (Vite) VERIFICATION

### 1️⃣ Frontend .env Configuration ✅

**File**: `client/.env.production`

```env
VITE_API_BASE_URL=https://richclub01.onrender.com/api/v1
VITE_API_VERSION=v1
VITE_NODE_ENV=production
VITE_RAZORPAY_KEY_ID=rzp_live_xxx
```

**Status**: ✅ Correct

### 2️⃣ Axios Configuration ✅

**File**: `client/src/utils/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

**Status**: ✅ Correct - Single source of truth

### 3️⃣ API Call Example Verification

**File**: `client/src/services/apiService.js`

```javascript
export const login = (email, password) => {
    return api.post('/auth/login', { email, password });
};
```

**Resolution Chain:**
```
api.post('/auth/login')
↓
baseURL: https://richclub01.onrender.com/api/v1
↓
Final URL: https://richclub01.onrender.com/api/v1/auth/login ✅
↓
Backend route: /api/v1/auth (Line 58) ✅
```

**Status**: ✅ Perfect match!

### 4️⃣ Local Build Test

**⚠️ ACTION REQUIRED:**

```bash
cd client
npm run build
npm run preview
```

**Then test:**
1. Open `http://localhost:4173` (or whatever port preview shows)
2. Try to login
3. Check Network tab - should call `https://richclub01.onrender.com/api/v1/auth/login`

**If login fails locally** → Frontend bug (fix before deploying)
**If login works locally** → Ready for deployment ✅

---

## 🚀 PHASE 3 — DEPLOYMENT TO VERCEL

### Vercel Environment Variables

**⚠️ ACTION REQUIRED:**

1. Go to: https://vercel.com/dashboard
2. Select your project: `richclub02` (or your project name)
3. Go to: **Settings** → **Environment Variables**
4. Set these variables:

```
Name: VITE_API_BASE_URL
Value: https://richclub01.onrender.com/api/v1
Environment: ✅ Production

Name: VITE_API_VERSION
Value: v1
Environment: ✅ Production

Name: VITE_NODE_ENV
Value: production
Environment: ✅ Production

Name: VITE_RAZORPAY_KEY_ID
Value: <your-razorpay-key>
Environment: ✅ Production
```

5. Click **Save**

### Trigger Deployment

**Option A - From Vercel Dashboard:**
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. **IMPORTANT**: Uncheck "Use existing Build Cache"

**Option B - From Git:**
```bash
git add .
git commit -m "chore: verify production environment configuration"
git push origin main
```

---

## 🔍 PHASE 4 — FINAL VERIFICATION

### 1️⃣ Wait for Deployment
- Vercel deployment typically takes 2-3 minutes
- Watch the deployment logs for any errors

### 2️⃣ Test Production Site

**⚠️ ACTION REQUIRED:**

1. Open: `https://richclub01.com`
2. Open **DevTools** → **Network** tab
3. Click **Login** (or any action that calls API)

### 3️⃣ Verify Network Requests

**You MUST see:**
```
POST https://richclub01.onrender.com/api/v1/auth/login
```

**Possible Outcomes:**

✅ **Status 200** → SUCCESS! Everything works!

✅ **Status 401** → Credentials issue (GOOD sign - API is reachable)

❌ **Status 404** → WRONG PATH
   - Check: Is the URL exactly `https://richclub01.onrender.com/api/v1/auth/login`?
   - If not, frontend is using wrong base URL
   - Solution: Verify Vercel environment variables

❌ **CORS Error** → CLIENT_URL mismatch
   - Error: "Access-Control-Allow-Origin"
   - Solution: Update `CLIENT_URL` in Render to match your Vercel URL
   - Or update CORS array in `server.js` to include Vercel URL

❌ **Network Error / Timeout** → Backend is down
   - Test: `https://richclub01.onrender.com/api/v1/health`
   - If health check fails, backend needs debugging

### 4️⃣ Test Critical Paths

Once login works, test these:

- [ ] **Home Page** → Should load hero slider (calls `/api/v1/home-content`)
- [ ] **Shop Page** → Should load products (calls `/api/v1/products`)
- [ ] **Product Details** → Should show product info (calls `/api/v1/products/:id`)
- [ ] **Add to Cart** → Should work
- [ ] **Checkout** → Should create order (calls `/api/v1/orders`)
- [ ] **Admin Login** → Should authenticate (calls `/api/v1/auth/login`)
- [ ] **Admin Dashboard** → Should load stats (calls `/api/v1/admin/stats`)

---

## 📊 FINAL STATUS CHECKLIST

### Backend (Render)
- [ ] Health check returns 200: `https://richclub01.onrender.com/api/v1/health`
- [ ] Environment variables set correctly
- [ ] CORS configured with correct CLIENT_URL
- [ ] Routes use `/api/v1/*` prefix

### Frontend (Vercel)
- [ ] Environment variables set in Vercel dashboard
- [ ] Build completes without errors
- [ ] Deployment successful
- [ ] No console errors on production site

### Integration
- [ ] Network requests show correct URLs (`https://richclub01.onrender.com/api/v1/*`)
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] Login works
- [ ] All critical paths tested

---

## 🆘 TROUBLESHOOTING GUIDE

### Issue: 404 on `/api/v1/auth/login`

**Diagnosis:**
```bash
# Test backend directly
curl https://richclub01.onrender.com/api/v1/health
```

**If 404:**
- Backend routes not configured correctly
- Check `server.js` lines 58-66

**If 200:**
- Frontend using wrong URL
- Check Vercel environment variables

### Issue: CORS Error

**Error Message:**
```
Access to XMLHttpRequest at 'https://richclub01.onrender.com/api/v1/auth/login' 
from origin 'https://richclub01.com' has been blocked by CORS policy
```

**Solution:**
1. Go to Render → Environment
2. Set `CLIENT_URL=https://richclub01.com`
3. Redeploy backend

### Issue: Environment Variable Not Found

**Error in Console:**
```
❌ VITE_API_BASE_URL is not defined
```

**Solution:**
1. Verify variables set in Vercel dashboard
2. Redeploy (must rebuild after setting env vars)
3. Check deployment logs for env var injection

---

## 🎯 SUCCESS CRITERIA

**You know it's working when:**

1. ✅ Home page loads without errors
2. ✅ Network tab shows requests to `richclub01.onrender.com/api/v1/*`
3. ✅ No 404 errors
4. ✅ No CORS errors
5. ✅ Login works
6. ✅ Admin panel accessible
7. ✅ Products load
8. ✅ Orders can be created

**Time to complete:** ~10-15 minutes (if no issues)

---

## 📝 NOTES

- Backend supports BOTH `/api/v1/*` (versioned) and `/api/*` (legacy)
- Frontend is configured to use `/api/v1/*` (versioned)
- This gives you flexibility for gradual migration
- Once everything works, you can remove legacy routes

**Last Updated:** 2026-01-14
**Status:** Ready for deployment
