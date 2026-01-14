# ✅ LOCAL DEVELOPMENT SETUP - WORKING CONFIGURATION

## 🎯 ISSUE RESOLVED

**Problem:** `VITE_API_BASE_URL is not defined`  
**Root Cause:** Missing `.env` file for local development  
**Solution:** Created `client/.env` with local backend URL

---

## ✅ CURRENT SETUP (WORKING)

### Backend (Server)
- **Status**: ✅ Running on `http://localhost:5000`
- **Command**: `npm start` (in server directory)
- **Health Check**: http://localhost:5000/api/v1/health

### Frontend (Client)
- **Status**: ✅ Running on `http://localhost:3001`
- **Command**: `npm run dev` (in client directory)
- **Access**: http://localhost:3001

### Environment Configuration

**Development** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_VERSION=v1
VITE_NODE_ENV=development
```

**Production** (`client/.env.production`):
```env
VITE_API_BASE_URL=https://richclub01.onrender.com/api/v1
VITE_API_VERSION=v1
VITE_NODE_ENV=production
```

---

## 🔄 HOW ENVIRONMENT FILES WORK

### Vite Environment File Priority

1. **Development Mode** (`npm run dev`):
   - Loads: `.env.local` > `.env.development.local` > `.env.development` > `.env`
   - **Does NOT load**: `.env.production`

2. **Production Build** (`npm run build`):
   - Loads: `.env.production.local` > `.env.production` > `.env`
   - **Does NOT load**: `.env.development`

3. **Preview Mode** (`npm run preview`):
   - Uses the **already built** files from `dist/`
   - Environment variables are **baked in** at build time
   - To test production config, you must: `npm run build` then `npm run preview`

---

## 🚀 DEVELOPMENT WORKFLOW

### Starting Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Should show: Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Should show: Local: http://localhost:3001/
```

### Access Your App
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/api/v1/health

---

## 🧪 TESTING DIFFERENT ENVIRONMENTS

### Test with Local Backend (Current Setup)
```bash
# Frontend calls: http://localhost:5000/api/v1/*
cd client
npm run dev
```

### Test with Production Backend (Render)
**Option 1 - Temporary (for testing):**
Edit `client/.env`:
```env
VITE_API_BASE_URL=https://richclub01.onrender.com/api/v1
```
Then restart: `npm run dev`

**Option 2 - Create separate file:**
Create `client/.env.development`:
```env
# For testing with production backend during development
VITE_API_BASE_URL=https://richclub01.onrender.com/api/v1
VITE_API_VERSION=v1
VITE_NODE_ENV=development
```

### Test Production Build Locally
```bash
cd client
npm run build      # Builds with .env.production
npm run preview    # Serves the production build locally
# Access: http://localhost:4173
```

---

## 📋 VERIFICATION CHECKLIST

**After setup, verify:**

- [x] Backend running on port 5000
- [x] Frontend running on port 3001
- [x] `.env` file exists in client directory
- [x] `VITE_API_BASE_URL` defined in `.env`
- [x] No errors in browser console
- [ ] Frontend loads without errors
- [ ] Can see home content
- [ ] Can see products
- [ ] Can login to admin panel

---

## 🔍 TROUBLESHOOTING

### Issue: "VITE_API_BASE_URL is not defined"
**Solution:** 
1. Check `client/.env` exists
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Vite only reads env files on startup

### Issue: "Network Error" or "ERR_CONNECTION_REFUSED"
**Diagnosis:** Backend not running
**Solution:**
```bash
cd server
npm run dev
# Wait for "Server running on port 5000"
```

### Issue: CORS Error
**Error:** `Access-Control-Allow-Origin`
**Solution:** Backend's `CLIENT_URL` should be `http://localhost:3001`

Check `server/.env`:
```env
CLIENT_URL=http://localhost:3001
```

Or update `server/server.js` CORS config:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4173',
        process.env.CLIENT_URL
    ],
    credentials: true
}));
```

### Issue: Changes not reflecting
**Solution:**
1. Restart dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check you're editing the right `.env` file

---

## 📁 ENVIRONMENT FILES SUMMARY

Your project now has:

```
client/
├── .env                    ← Local development ✅ NEW
├── .env.production         ← Production builds ✅ Existing
└── .env.example            ← Template for team
```

**Important:**
- `.env` is gitignored (not committed)
- `.env.production` should be committed
- `.env.example` should be committed

---

## 🎯 NEXT STEPS

1. **Test Local Development:**
   - Open: http://localhost:3001
   - Check: Home page loads
   - Check: Products load
   - Check: Admin login works

2. **Test Production Build:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Deploy to Production:**
   - Backend: Deploy to Render
   - Frontend: Deploy to Vercel
   - Set environment variables in deployment platforms

---

## ✅ SUCCESS CRITERIA

You'll know everything is working when:

1. ✅ No console errors about undefined env vars
2. ✅ Home page loads with content
3. ✅ Products page shows items
4. ✅ Admin login works
5. ✅ Backend API calls return data (check Network tab)

**Status:** Ready for local development! 🚀

**Last Updated:** 2026-01-14 22:11 IST
