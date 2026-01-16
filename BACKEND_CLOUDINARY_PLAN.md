# ☁️ CLOUDINARY BACKEND INTEGRATION PLAN

**Objective:** migrate from local file storage (ephemeral) to Cloudinary (persistent CDN) for all image uploads.

---

## 📦 PHASE 1: INSTALLATION & CONFIGURATION

### 1. Install Dependencies
```bash
npm install cloudinary multer-storage-cloudinary
```

### 2. Create Configuration (`server/config/cloudinary.js`)
Initialize Cloudinary with credentials from environment variables.

### 3. Update Environment Variables (`server/.env`)
Add Cloudinary credentials (API Key, Secret, Cloud Name).

---

## 🛠️ PHASE 2: REFACTOR UPLOAD LOGIC

### 1. Update `server/routes/uploadRoutes.js`

**Current Logic:**
- `multer.memoryStorage()`
- `sharp` processing (Resize -> WebP)
- `fs.writeFile` to local disk
- Returns local URL (`https://host/uploads/...`)

**New Logic:**
- `multer.memoryStorage()` (Keep strict validation)
- `sharp` processing (Optional, or rely on Cloudinary)
- **Upload to Cloudinary** using `upload_stream`
- Return **Cloudinary secure_url**

### 2. Update `server/middlewares/upload.js`
Replace local disk storage with Cloudinary storage engine (or keep as memory storage for consistency).

### 3. Remove Local File Serving
Remove `app.use('/uploads', ...)` from `server.js` (or keep for backward compatibility but deprecate).

---

## 🔄 PHASE 3: VERIFICATION

1. **Test CMS Uploads**: Verify Hero banners upload to Cloudinary.
2. **Test Product Uploads**: Verify product images upload to Cloudinary.
3. **Verify Persistence**: Restart server and ensure images still load.
4. **Verify Optimization**: Check if Cloudinary delivers optimized images (WebP/AVIF).

---

## ⚠️ MIGRATION NOTES

- **Existing Images**: Old images stored locally will **BREAK** if we remove the `/uploads` route or redeploy to a fresh server instance (like Render).
- **Strategy**: This change is foward-looking. New uploads will work. Admin should re-upload critical images (Hero banners) if they disappear.

---

## 🚀 START MIGRATION?

Shall I proceed with **Phase 1: Installation & Configuration**?
