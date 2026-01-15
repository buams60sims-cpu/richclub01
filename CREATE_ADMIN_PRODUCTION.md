# Create Admin User in Production

## Problem
Admin user exists locally but not in production MongoDB database.

## Solution

### Method 1: Via Render Shell (Recommended)

1. Go to **Render Dashboard**
2. Click on your backend service (`richclub01`)
3. Go to **Shell** tab
4. Run:
   ```bash
   node createAdmin.js
   ```
5. Look for output:
   ```
   ✅ Admin user created successfully!
   📧 Email: admin@richclub.com
   🔑 Password: admin123
   ```

### Method 2: Via Local Script (Alternative)

1. Get your **Production MongoDB URI** from Render environment variables
2. Temporarily create `server/.env.production.local`:
   ```
   MONGO_URI=mongodb+srv://your-production-uri
   ```
3. Run locally:
   ```bash
   cd server
   node -r dotenv/config createAdmin.js dotenv_config_path=.env.production.local
   ```
4. Delete `.env.production.local` after

### Method 3: Via MongoDB Atlas (Database Direct)

1. Log into **MongoDB Atlas**
2. Go to **Collections** → `users`
3. Click **Insert Document**
4. Paste:
   ```json
   {
     "name": "Admin User",
     "email": "admin@richclub.com",
     "password": "$2a$10$vI8aWBZOlM9DJEz8LJ8xauFR3N8MYFqI0xYRqOvXpRJ1j.I8EQODK",
     "role": "ADMIN",
     "isActive": true
   }
   ```
   *(The password hash is for "admin123")*

## Verification

After creating the admin user, test login:
- Email: `admin@richclub.com`
- Password: `admin123`

Should return `200 OK` instead of `401 Unauthorized`.
