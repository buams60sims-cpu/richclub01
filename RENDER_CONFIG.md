# Render Deployment Configuration

## Environment Variables (DO NOT SET PORT)

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/richclub
JWT_SECRET=<generate-strong-secret-min-32-chars>
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=live_secret_xxx
WHATSAPP_DAILY_SUMMARY=916362145668
CLIENT_URL=https://richclub01.com
```

## Build Settings

- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## CRITICAL: PORT Handling

❌ **DO NOT** set `PORT` in Render environment variables
✅ Render automatically sets `PORT` (usually 10000)
✅ Code already handles it: `const PORT = process.env.PORT || 5000;`

## Why No PORT Variable?

Render assigns dynamic ports and injects `PORT` automatically.
If you set it manually, it conflicts with Render's internal routing.

## After Deployment

1. Copy your Render URL: `https://richclub-api.onrender.com`
2. Set in Vercel: `VITE_API_BASE_URL=https://richclub-api.onrender.com/api/v1`
3. Redeploy frontend with cache cleared
