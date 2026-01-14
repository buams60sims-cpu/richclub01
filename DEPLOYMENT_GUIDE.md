# DEPLOYMENT GUIDE - CRITICAL

## PROBLEM IDENTIFIED

Frontend is deployed on Vercel at `richclub01.com` but backend is NOT deployed.

Frontend is calling `/api/products` expecting backend on same domain → 404 error.

## SOLUTION OPTIONS

### Option 1: Deploy Backend Separately (RECOMMENDED)

Deploy backend to Render/Railway/Heroku, then update frontend to point to it.

#### Step 1: Deploy Backend to Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=5000
     MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/richclub
     JWT_SECRET=<generate-strong-secret>
     RAZORPAY_KEY_ID=rzp_live_xxx
     RAZORPAY_KEY_SECRET=live_secret_xxx
     WHATSAPP_DAILY_SUMMARY=916362145668
     CLIENT_URL=https://richclub01.com
     ```

5. Deploy → Get URL like `https://richclub-api.onrender.com`

#### Step 2: Update Frontend Environment

In Vercel dashboard, set environment variable:
```
VITE_API_BASE_URL=https://richclub-api.onrender.com/api/v1
```

Redeploy frontend.

#### Step 3: Update Backend CORS

In `server.js`, add Vercel domain:
```javascript
const allowedOrigins = [
    'https://richclub01.com',
    'https://www.richclub01.com'
];
```

---

### Option 2: Use Vercel Proxy (TEMPORARY)

Keep backend on localhost, use Vercel rewrites to proxy requests.

**NOT RECOMMENDED** - Only for testing. Backend must be publicly accessible.

---

### Option 3: Backend on Same Vercel Project (NOT IDEAL)

Vercel is frontend-focused. Node.js backend as serverless functions has limitations:
- 10s timeout
- No WebSockets
- Cold starts
- Not suitable for MongoDB connections

**Skip this option.**

---

## RECOMMENDED ARCHITECTURE

```
Frontend (Vercel)          Backend (Render)
richclub01.com     →       richclub-api.onrender.com
                           ↓
                      MongoDB Atlas
```

---

## DEPLOYMENT CHECKLIST

### Backend (Render/Railway)

- [ ] Create account on Render.com
- [ ] Connect GitHub repo
- [ ] Set environment variables (see above)
- [ ] Deploy backend
- [ ] Test health check: `https://your-api.onrender.com/api/v1/health`
- [ ] Verify DB connection in health response

### Frontend (Vercel)

- [ ] Set `VITE_API_BASE_URL` in Vercel dashboard
- [ ] Update to: `https://your-api.onrender.com/api/v1`
- [ ] Redeploy frontend
- [ ] Test API calls in browser console

### Backend CORS Update

- [ ] Add `richclub01.com` to allowed origins
- [ ] Add `www.richclub01.com` if using www
- [ ] Redeploy backend

### Database (MongoDB Atlas)

- [ ] Create MongoDB Atlas cluster (if not done)
- [ ] Whitelist Render IP or use 0.0.0.0/0
- [ ] Update `MONGO_URI` in backend env vars
- [ ] Test connection

---

## QUICK FIX (RIGHT NOW)

### 1. Deploy Backend to Render

```bash
# In Render dashboard
Build Command: cd server && npm install
Start Command: cd server && npm start
```

### 2. Get Backend URL

Example: `https://richclub-api.onrender.com`

### 3. Update Frontend in Vercel

Go to Vercel → Settings → Environment Variables:
```
VITE_API_BASE_URL=https://richclub-api.onrender.com/api/v1
```

### 4. Redeploy Frontend

Vercel will auto-redeploy with new env var.

### 5. Update Backend CORS

```javascript
const allowedOrigins = [
    'https://richclub01.com',
    'https://www.richclub01.com',
    'http://localhost:5173'
];
```

Commit and push → Render auto-deploys.

---

## TESTING AFTER DEPLOYMENT

### Test 1: Health Check
```bash
curl https://richclub-api.onrender.com/api/v1/health
```
**Expected:** `{ "status": "ok", "db": "connected" }`

### Test 2: Get Products
```bash
curl https://richclub-api.onrender.com/api/v1/products
```
**Expected:** Products array

### Test 3: Frontend API Call
Open `https://richclub01.com/shop` in browser console:
```javascript
fetch('https://richclub-api.onrender.com/api/v1/products')
  .then(r => r.json())
  .then(console.log);
```
**Expected:** Products displayed

---

## ALTERNATIVE: Railway.app

If Render is slow, use Railway:

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select server folder
4. Add environment variables
5. Deploy

Railway gives you: `https://richclub-api.up.railway.app`

---

## COST ESTIMATE

- **Render Free Tier**: $0/month (sleeps after 15min inactivity)
- **Render Starter**: $7/month (always on)
- **Railway Free**: $5 credit/month
- **MongoDB Atlas Free**: $0/month (512MB)
- **Vercel Free**: $0/month

**Total for production**: ~$7/month

---

## CURRENT ERROR EXPLAINED

```
Request URL: https://richclub01.com/api/products
Status: 404 Not Found
x-vercel-error: NOT_FOUND
```

**Why?** Vercel is serving frontend only. No backend deployed.

**Fix?** Deploy backend separately, update `VITE_API_BASE_URL`.

---

## ACTION REQUIRED NOW

1. Deploy backend to Render (15 minutes)
2. Update `VITE_API_BASE_URL` in Vercel
3. Redeploy frontend
4. Test

**DO NOT** try to run backend on Vercel. Use Render/Railway.
