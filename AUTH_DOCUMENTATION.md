# Authentication Implementation Guide

## ✅ JWT Authentication Complete

Admin authentication has been successfully implemented using JWT tokens with bcrypt password hashing.

---

## 🔐 Authentication Flow

### 1. Admin Login
- Admin provides email and password
- Server validates credentials
- Password is compared using bcrypt
- JWT token generated (expires in 1 day)
- Token returned to client

### 2. Protected Route Access
- Client includes token in Authorization header: `Bearer <token>`
- Server verifies token validity
- User attached to `req.user`
- Admin role checked if required
- Request proceeds or rejected

---

## 📝 API Endpoints

### Authentication Routes

#### Login
**POST** `/api/auth/login`

**Request Body**:
```json
{
  "email": "admin@richclub.com",
  "password": "admin123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Admin User",
    "email": "admin@richclub.com",
    "role": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
```json
// Invalid credentials (401)
{
  "success": false,
  "message": "Invalid email or password"
}

// Not an admin (403)
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}

// Inactive account (401)
{
  "success": false,
  "message": "Account is inactive. Please contact administrator."
}
```

---

#### Get Current User
**GET** `/api/auth/me`

**Headers**:
```
Authorization: Bearer <your-jwt-token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Admin User",
    "email": "admin@richclub.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-01-03T14:20:00.000Z"
  }
}
```

**Error Responses**:
```json
// No token (401)
{
  "success": false,
  "message": "Access denied. No token provided."
}

// Invalid token (401)
{
  "success": false,
  "message": "Invalid token"
}

// Expired token (401)
{
  "success": false,
  "message": "Token has expired"
}

// Not admin (403)
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 🔒 Protected Routes

### Products
- ✅ **POST /api/products** - Create product (Admin only)
- ✅ **PUT /api/products/:id** - Update product (Admin only)
- ✅ **DELETE /api/products/:id** - Delete product (Admin only)
- ⭕ **GET /api/products** - Get all products (Public)
- ⭕ **GET /api/products/:id** - Get product by ID (Public)
- ⭕ **GET /api/products/:id/stock/:size** - Check stock (Public)

### Coupons
- ✅ **POST /api/coupons** - Create coupon (Admin only)
- ✅ **GET /api/coupons** - Get all coupons (Admin only)
- ✅ **PUT /api/coupons/:id** - Update coupon (Admin only)
- ✅ **DELETE /api/coupons/:id** - Delete coupon (Admin only)
- ⭕ **POST /api/coupons/validate** - Validate coupon (Public)

### Orders
- ✅ **GET /api/orders** - Get all orders (Admin only)
- ✅ **GET /api/orders/:id** - Get order by ID (Admin only)
- ✅ **PUT /api/orders/:id/status** - Update order status (Admin only)
- ✅ **PUT /api/orders/:id/cancel** - Cancel order (Admin only)
- ⭕ **POST /api/orders** - Create order (Public)
- ⭕ **GET /api/orders/invoice/:invoiceNumber** - Track order (Public)

**Legend**: ✅ Protected (Admin only) | ⭕ Public

---

## 🧪 Testing with Postman

### Step 1: Create Admin User (MongoDB)

Since there's no registration endpoint, create an admin manually in MongoDB:

```javascript
// Connect to MongoDB
use richclub

// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@richclub.com",
  password: "$2a$10$YourHashedPasswordHere", // Will be hashed on first save
  role: "ADMIN",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**OR** use this Node.js script to create an admin:

```javascript
// createAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@richclub.com',
    password: 'admin123', // Will be automatically hashed
    role: 'ADMIN',
    isActive: true
  });
  console.log('Admin created:', admin);
  process.exit(0);
};

createAdmin();
```

---

### Step 2: Login to Get Token

**Request**:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@richclub.com",
  "password": "admin123"
}
```

**Save the token** from the response.

---

### Step 3: Use Token for Protected Routes

**Example - Create Product**:
```
POST http://localhost:5000/api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Premium T-Shirt",
  "price": 599,
  "category": "men",
  "sizes": {
    "S": 10,
    "M": 15,
    "L": 20,
    "XL": 8
  }
}
```

---

### Step 4: Test Public Routes (No Token)

**Example - Get Products**:
```
GET http://localhost:5000/api/products
```

**Example - Create Order**:
```
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St, Mumbai"
  },
  "items": [
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "size": "M",
      "quantity": 2
    }
  ]
}
```

---

## 🔧 Postman Environment Setup

Create environment variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:5000` |
| `admin_token` | `<paste-token-after-login>` |

**Auto-save token** after login:
```javascript
// In Tests tab of login request
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("admin_token", response.data.token);
}
```

**Use token** in protected routes:
```
Authorization: Bearer {{admin_token}}
```

---

## 🛡️ Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds: 10
- ✅ Passwords never returned in responses
- ✅ Password field excluded by default (`select: false`)
- ✅ Pre-save hook automatically hashes on user creation/update

### Token Security
- ✅ JWT signed with secret from environment
- ✅ Token expiry: 1 day
- ✅ Token verification on every protected request
- ✅ Invalid/expired tokens rejected with clear errors

### Route Protection
- ✅ Two-layer protection: `verifyJWT` + `isAdmin`
- ✅ User attached to `req.user` for controller access
- ✅ Inactive accounts rejected
- ✅ Non-admin users blocked from admin routes

### Error Handling
- ✅ Clear, specific error messages
- ✅ Proper HTTP status codes (401, 403, etc.)
- ✅ No sensitive information leaked
- ✅ Centralized error handling

---

## 📂 Files Created/Modified

### New Files (4):
1. `server/utils/jwtUtils.js` - JWT generation and verification
2. `server/middlewares/auth.js` - Authentication middleware
3. `server/controllers/authController.js` - Login and user info
4. `server/routes/authRoutes.js` - Auth route definitions

### Modified Files (6):
1. `server/models/User.js` - Added password hashing and comparison
2. `server/routes/productRoutes.js` - Protected admin routes
3. `server/routes/couponRoutes.js` - Protected admin routes
4. `server/routes/orderRoutes.js` - Protected admin routes
5. `server/server.js` - Registered auth routes
6. `server/server.js` - Updated API documentation

---

## ✅ Implementation Checklist

- ✅ Password hashing with bcrypt (pre-save hook)
- ✅ Password comparison method
- ✅ JWT token generation (1 day expiry)
- ✅ JWT token verification
- ✅ `verifyJWT` middleware
- ✅ `isAdmin` middleware
- ✅ Login endpoint
- ✅ Get current user endpoint
- ✅ Protected product routes (create, update, delete)
- ✅ Protected coupon routes (create, get all, update, delete)
- ✅ Protected order routes (get all, get by ID, update status, cancel)
- ✅ Public routes remain accessible
- ✅ Proper error messages
- ✅ HTTP status codes
- ✅ No breaking changes to existing APIs
- ✅ Server runs without errors

---

## 🚀 Quick Start

1. **Create admin user** (use script or MongoDB directly)
2. **Login** via `POST /api/auth/login`
3. **Copy token** from response
4. **Use token** in Authorization header for protected routes
5. **Test public routes** without token

---

## 🔍 Troubleshooting

### "Access denied. No token provided"
- Ensure Authorization header is set
- Format: `Authorization: Bearer <token>`
- Check for typos in "Bearer" (capital B)

### "Invalid token"
- Token might be malformed
- Check if token was copied correctly
- Ensure no extra spaces

### "Token has expired"
- Login again to get a new token
- Tokens expire after 1 day

### "Access denied. Admin privileges required"
- User must have role: ADMIN
- Check user role in database
- Regular users cannot access admin routes

### "Invalid email or password"
- Check credentials
- Ensure admin user exists in database
- Verify password is correct

---

## 📊 Token Structure

**Payload**:
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "iat": 1704297600,
  "exp": 1704384000
}
```

**Expiry**: 24 hours (86400 seconds)

---

## 🎯 Next Steps

1. ✅ Test all protected routes with Postman
2. ✅ Test all public routes without token
3. ✅ Verify error responses
4. ✅ Create admin user for testing
5. ⏭️ Integrate with frontend
6. ⏭️ Add refresh token mechanism (optional)
7. ⏭️ Add password reset functionality (optional)
8. ⏭️ Add rate limiting (optional)

---

**Authentication Status**: ✅ FULLY IMPLEMENTED
**Breaking Changes**: ❌ NONE
**Server Status**: ✅ RUNNING
**Ready for Testing**: ✅ YES
