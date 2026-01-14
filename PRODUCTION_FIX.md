# CRITICAL FIX - PRODUCTION 404 ERROR

## ROOT CAUSE IDENTIFIED

Frontend is calling `/api/products` because **Vercel environment variable is NOT set**.

When `VITE_API_BASE_URL` is undefined in production:
- Vite replaces `import.meta.env.VITE_API_BASE_URL` with `undefined`
- Code becomes: `baseURL: undefined || 'http://localhost:5000/api/v1'`
- In production build, this resolves to relative path `/api/v1`
- Browser calls `https://richclub01.com/api/products` → 404

## IMMEDIATE FIX (DO THIS NOW)

### Step 1: Set Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project `richclub01`
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend.onrender.com/api/v1
   ```
5. Select: **Production**, **Preview**, **Development**
6. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" = **OFF**
5. Click **Redeploy**

### Step 3: Verify

After deployment completes:
```bash
# Check if env var is in build
curl https://richclub01.com/_next/static/chunks/main-*.js | grep VITE_API_BASE_URL

# Test API call
curl https://richclub01.com/shop
# Should call your backend, not /api/products
```

---

## IF YOU DON'T HAVE BACKEND DEPLOYED YET

### Option A: Deploy Backend First (RECOMMENDED)

1. Go to https://render.com
2. Create **New Web Service**
3. Connect GitHub repo
4. **Root Directory**: `server`
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=<strong-secret>
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   WHATSAPP_DAILY_SUMMARY=916362145668
   CLIENT_URL=https://richclub01.com
   ```
8. Click **Create Web Service**
9. Wait for deployment (5-10 minutes)
10. Copy URL: `https://richclub-api.onrender.com`

Then set in Vercel:
```
VITE_API_BASE_URL=https://richclub-api.onrender.com/api/v1
```

### Option B: Temporary Proxy (NOT RECOMMENDED)

Use Vercel rewrites to proxy to localhost (only for testing):

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "http://your-public-ip:5000/api/v1/:path*"
    }
  ]
}
```

**This won't work** because:
- Localhost is not accessible from Vercel
- You need public IP with port forwarding
- Not suitable for production

---

## VERIFICATION CHECKLIST

After setting `VITE_API_BASE_URL` in Vercel:

- [ ] Environment variable added in Vercel dashboard
- [ ] Applied to Production environment
- [ ] Redeployed with cache cleared
- [ ] Checked browser network tab shows correct backend URL
- [ ] No more calls to `richclub01.com/api/*`
- [ ] API calls go to backend domain

---

## WHY THIS HAPPENED

1. **Code is correct** - Uses `import.meta.env.VITE_API_BASE_URL`
2. **Vercel env var missing** - Not set in dashboard
3. **Build-time replacement** - Vite replaces env vars at build time
4. **Fallback fails** - `|| 'http://localhost:5000/api/v1'` becomes relative in production

---

## CURRENT STATE

```
Frontend: richclub01.com (Vercel) ✅
Backend: NOT DEPLOYED ❌
Env Var: NOT SET ❌
```

**Result:** Frontend calls `/api/products` on same domain → 404

---

## TARGET STATE

```
Frontend: richclub01.com (Vercel) ✅
Backend: richclub-api.onrender.com (Render) ✅
Env Var: VITE_API_BASE_URL=https://richclub-api.onrender.com/api/v1 ✅
```

**Result:** Frontend calls backend → 200 OK

---

## ACTION REQUIRED NOW

1. Deploy backend to Render (15 min)
2. Set `VITE_API_BASE_URL` in Vercel
3. Redeploy frontend with cache cleared
4. Test in browser

**DO NOT SKIP STEP 2** - Environment variable is MANDATORY.
