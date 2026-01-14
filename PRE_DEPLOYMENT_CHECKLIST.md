# PRE-DEPLOYMENT CHECKLIST
**Complete ALL items before frontend integration**

## ✅ 1. API VERSIONING
- [x] All routes use `/api/v1` prefix
- [x] Legacy routes maintained for backward compatibility
- [x] Root endpoint returns API version info
- [ ] Frontend updated to use `/api/v1` (PENDING)
- [ ] Remove legacy routes after frontend migration

**Verify:**
```bash
curl http://localhost:5000/
# Should show: "apiVersion": "v1", "baseUrl": "/api/v1"
```

---

## ✅ 2. AUTH BOUNDARIES VERIFIED
- [x] JWT middleware on all protected routes
- [x] Auth verification script created
- [ ] Run auth verification test

**Test NOW:**
```bash
cd server
npm run verify-auth
```

**Expected:** All tests pass, protected routes return 401 without token

**If ANY test fails → SECURITY HOLE → Fix before proceeding**

---

## ✅ 3. HEALTH CHECK ENHANCED
- [x] Returns DB connection status
- [x] Returns uptime in seconds
- [x] Returns environment
- [x] Returns version
- [x] Returns memory usage
- [x] Returns 503 if DB disconnected

**Verify:**
```bash
curl http://localhost:5000/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 123,
  "environment": "development",
  "version": "1.0.0"
}
```

---

## ✅ 4. API CONTRACT LOCKED
- [x] API_CONTRACT.md created
- [x] All request/response formats documented
- [x] Error codes standardized
- [x] Rate limits documented
- [ ] Frontend team reviewed contract

**Critical Rules:**
1. Server-side pricing calculation (NEVER trust client)
2. Upload-only for images (NO URLs)
3. Stock reduced ONLY after payment verification
4. Standard error format: `{ success: false, message: "..." }`

---

## ✅ 5. FRONTEND INTEGRATION READY
- [x] `.env.example` created for frontend
- [x] API client updated to use versioned endpoints
- [x] Environment variable configuration added
- [ ] Create `.env.local` from template
- [ ] Set `VITE_API_BASE_URL=http://localhost:5000/api/v1`

**Frontend Setup:**
```bash
cd client
cp .env.example .env.local
# Edit .env.local and set VITE_API_BASE_URL
```

---

## ⚠️ 6. IMAGE UPLOAD FLOW VERIFIED
- [x] Product upload accepts multipart/form-data
- [x] CMS upload accepts multipart/form-data
- [x] Sharp compression enforced
- [x] WebP conversion enabled
- [ ] Test product image upload
- [ ] Test hero image upload
- [ ] Test custom design image upload

**Test Upload:**
```bash
# Get admin token first
TOKEN="your_jwt_token"

# Test product upload
curl -X POST http://localhost:5000/api/v1/upload/product \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg"

# Should return: { "success": true, "imageUrl": "/uploads/products/..." }
```

---

## 🧪 7. CRITICAL API TESTS (BEFORE FRONTEND)

### Test 1: Create Product
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test",
    "category": "T-SHIRTS",
    "price": { "original": 999, "selling": 799 },
    "sizes": { "M": 10, "L": 10 },
    "images": ["/uploads/products/test.jpg"]
  }'
```

### Test 2: Place Order
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Test User",
      "phone": "+91 98765 43210",
      "address": "Test Address"
    },
    "items": [{
      "productId": "PRODUCT_ID_HERE",
      "size": "M",
      "quantity": 1
    }],
    "paymentMethod": "RAZORPAY"
  }'
```

### Test 3: Validate Coupon
```bash
curl -X POST http://localhost:5000/api/v1/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "subtotal": 1000
  }'
```

### Test 4: Get Razorpay Key
```bash
curl http://localhost:5000/api/v1/payments/razorpay-key
```

### Test 5: Check Stock
```bash
curl http://localhost:5000/api/v1/products/PRODUCT_ID/stock/M?quantity=2
```

---

## 🔒 8. SECURITY CHECKLIST
- [x] JWT_SECRET is strong (not default)
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] CORS configured
- [x] Auth middleware on protected routes
- [ ] Change JWT_SECRET in production
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS in production

---

## 📊 9. DATABASE VERIFICATION
- [ ] MongoDB connection stable
- [ ] Test data created (products, coupons)
- [ ] Admin user exists
- [ ] Home content initialized
- [ ] Indexes created

**Verify:**
```bash
# In MongoDB shell
use richclub
db.products.countDocuments()  // Should have products
db.users.findOne({ role: 'ADMIN' })  // Should have admin
db.homecontents.findOne()  // Should have home content
```

---

## 🚀 10. DEPLOYMENT READINESS
- [ ] All tests pass
- [ ] Auth boundaries verified
- [ ] API contract reviewed
- [ ] Frontend environment configured
- [ ] Image uploads tested
- [ ] Payment flow tested
- [ ] Error handling verified
- [ ] Rate limits tested

---

## 🎯 NEXT STEPS (IN ORDER)

### STEP 1: Verify Auth (CRITICAL)
```bash
cd server
npm run verify-auth
```
**If fails → Fix auth middleware immediately**

### STEP 2: Test Core APIs
Run all 5 API tests above manually or with Postman

### STEP 3: Update WhatsApp Number
```bash
cd server
npm run update-whatsapp
```

### STEP 4: Frontend Integration
```bash
cd client
cp .env.example .env.local
# Edit .env.local
npm run dev
```

### STEP 5: End-to-End Test
1. Browse products
2. Add to cart
3. Apply coupon
4. Place order
5. Make payment
6. Verify order status

---

## ⚠️ KNOWN ISSUES TO FIX

### Issue 1: Legacy Routes
**Status:** Temporary backward compatibility
**Action:** Remove after frontend migrates to v1
**Timeline:** 1 week after frontend deployment

### Issue 2: Image Cleanup
**Status:** Old images not deleted on replace
**Action:** Implement cleanup in upload middleware
**Priority:** Medium

### Issue 3: Stock Concurrency
**Status:** No transaction locking
**Action:** Add MongoDB transactions for stock updates
**Priority:** High (before production)

---

## 📝 PRODUCTION DEPLOYMENT CHANGES

### Environment Variables (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/richclub
JWT_SECRET=GENERATE_NEW_STRONG_SECRET_HERE
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=live_secret_xxx
WHATSAPP_DAILY_SUMMARY=916362145668
```

### Frontend Environment (.env.local)
```bash
VITE_API_BASE_URL=https://api.richclub.com/api/v1
VITE_NODE_ENV=production
```

---

## ✅ SIGN-OFF

- [ ] Backend developer verified all items
- [ ] Auth boundaries tested and secure
- [ ] API contract reviewed by frontend team
- [ ] All critical APIs tested manually
- [ ] Image upload flow verified
- [ ] Payment flow tested
- [ ] Ready for frontend integration

**Date:** ___________
**Signed:** ___________
