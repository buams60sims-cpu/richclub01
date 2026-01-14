# API CONTRACT v1.0.0
**LOCKED FOR FRONTEND INTEGRATION - DO NOT CHANGE WITHOUT VERSION BUMP**

## Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Field1 error, Field2 error"
}
```

## Authentication
Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 AUTH
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Admin login |
| GET | `/auth/me` | ✅ | Get current user |

**Login Request:**
```json
{
  "email": "admin@richclub.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "name": "Admin Name",
    "email": "admin@richclub.com",
    "role": "ADMIN"
  }
}
```

---

### 🛍️ PRODUCTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ❌ | Get all products |
| GET | `/products/:id` | ❌ | Get single product |
| GET | `/products/:id/stock/:size` | ❌ | Check stock |
| POST | `/products` | ✅ | Create product |
| PUT | `/products/:id` | ✅ | Update product |
| DELETE | `/products/:id` | ✅ | Delete product |

**Query Params (GET /products):**
- `category` - Filter by category
- `isActive` - Filter active/inactive
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

**Product Object:**
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "description": "Description",
  "category": "T-SHIRTS",
  "price": {
    "original": 999,
    "selling": 799
  },
  "sizes": {
    "S": 10,
    "M": 15,
    "L": 20,
    "XL": 5
  },
  "totalStock": 50,
  "images": ["/uploads/products/image1.jpg"],
  "isActive": true
}
```

---

### 🎟️ COUPONS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | ❌ | Validate coupon |
| GET | `/coupons` | ✅ | Get all coupons |
| POST | `/coupons` | ✅ | Create coupon |
| PUT | `/coupons/:id` | ✅ | Update coupon |
| DELETE | `/coupons/:id` | ✅ | Delete coupon |

**Validate Request:**
```json
{
  "code": "SAVE20",
  "subtotal": 1500
}
```

**Validate Response:**
```json
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "calculatedDiscount": 300
  }
}
```

---

### 📦 ORDERS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | ❌ | Create order |
| GET | `/orders` | ✅ | Get all orders |
| GET | `/orders/:id` | ✅ | Get order by ID |
| GET | `/orders/invoice/:invoiceNumber` | ❌ | Track order |
| PUT | `/orders/:id/status` | ✅ | Update status |
| PUT | `/orders/:id/cancel` | ✅ | Cancel order |
| GET | `/orders/:id/whatsapp` | ✅ | Get WhatsApp message |

**Create Order Request:**
```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+91 98765 43210",
    "address": "123 Street, City, State - 560001"
  },
  "items": [
    {
      "productId": "product_id",
      "size": "M",
      "quantity": 2
    }
  ],
  "couponCode": "SAVE20",
  "paymentMethod": "RAZORPAY"
}
```

**Order Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "invoiceNumber": "RC240115001",
    "customer": { ... },
    "items": [ ... ],
    "subtotal": 1598,
    "discount": 319,
    "totalAmount": 1279,
    "orderStatus": "PAYMENT_PENDING",
    "paymentStatus": "PENDING"
  }
}
```

**Order Statuses:**
- `PAYMENT_PENDING` - Awaiting payment
- `CONFIRMED` - Payment received
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

---

### 💳 PAYMENTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-order` | ❌ | Create Razorpay order |
| POST | `/payments/verify` | ❌ | Verify payment |
| GET | `/payments/razorpay-key` | ❌ | Get Razorpay key |

**Create Razorpay Order:**
```json
{
  "orderId": "order_id"
}
```

**Verify Payment:**
```json
{
  "orderId": "order_id",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

---

### 🏠 HOME CONTENT (CMS)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/home-content` | ❌ | Get home content |
| PUT | `/home-content/admin` | ✅ | Update content |

---

### 📤 UPLOADS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/product` | ✅ | Upload product image |
| POST | `/upload/cms` | ✅ | Upload CMS image |

**Upload Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file)
- Field: `section` (string) - "product" or "cms" or "hero"

**Upload Response:**
```json
{
  "success": true,
  "imageUrl": "/uploads/products/product-123.webp"
}
```

**Image Constraints:**
- Max size: 2MB (product), 5MB (hero)
- Formats: JPEG, PNG, WebP
- Auto-converted to WebP
- Auto-compressed with Sharp

---

### 🏥 HEALTH CHECK
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Server health |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "db": "connected",
  "memory": {
    "used": 150,
    "total": 512,
    "unit": "MB"
  }
}
```

---

### 📊 ADMIN
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/daily-summary/whatsapp` | ✅ | Daily summary |

---

## Error Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (No token) |
| 403 | Forbidden (Invalid token) |
| 404 | Not Found |
| 409 | Conflict (Duplicate) |
| 500 | Server Error |
| 503 | Service Unavailable (DB down) |

## Rate Limits
- Auth: 10 requests/minute
- Checkout: 15 requests/minute
- Admin: 60 requests/minute
- Upload: 10 requests/minute

## CRITICAL RULES FOR FRONTEND
1. ✅ **ALWAYS use `/api/v1` prefix**
2. ✅ **NEVER trust client-side pricing** - server calculates
3. ✅ **ALWAYS send JWT token** for protected routes
4. ✅ **NEVER send URLs for images** - upload files only
5. ✅ **ALWAYS handle `success: false`** responses
6. ✅ **Stock is reduced ONLY after payment verification**
7. ✅ **Order status flow**: PAYMENT_PENDING → CONFIRMED → SHIPPED → DELIVERED
