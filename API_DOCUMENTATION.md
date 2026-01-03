# Rich Club eCommerce API Documentation

Complete API reference for testing with Postman or any HTTP client.

**Base URL**: `http://localhost:5000`

---

## 📦 PRODUCTS API

### 1. Create Product
**POST** `/api/products`

**Request Body**:
```json
{
  "name": "Classic Cotton T-Shirt",
  "description": "Premium quality cotton t-shirt with comfortable fit",
  "price": 599,
  "category": "men",
  "sizes": {
    "S": 10,
    "M": 15,
    "L": 20,
    "XL": 8
  },
  "images": [
    "https://example.com/tshirt1.jpg",
    "https://example.com/tshirt2.jpg"
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Classic Cotton T-Shirt",
    "price": 599,
    "totalStock": 53,
    ...
  }
}
```

---

### 2. Get All Products
**GET** `/api/products`

**Query Parameters** (optional):
- `category` - Filter by category (men, women, kids, accessories, footwear, other)
- `isActive` - Filter by active status (true/false)
- `search` - Text search in name and description

**Examples**:
- Get all products: `GET /api/products`
- Get men's products: `GET /api/products?category=men`
- Get active products: `GET /api/products?isActive=true`
- Search products: `GET /api/products?search=cotton`

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### 3. Get Product by ID
**GET** `/api/products/:id`

**Example**: `GET /api/products/65a1b2c3d4e5f6g7h8i9j0k1`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Classic Cotton T-Shirt",
    "price": 599,
    ...
  }
}
```

---

### 4. Update Product
**PUT** `/api/products/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Updated Product Name",
  "price": 699,
  "sizes": {
    "S": 5,
    "M": 10,
    "L": 15,
    "XL": 5
  },
  "isActive": true
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

---

### 5. Delete Product (Soft Delete)
**DELETE** `/api/products/:id`

**Response** (200):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 6. Check Stock Availability
**GET** `/api/products/:id/stock/:size`

**Query Parameters**:
- `quantity` - Quantity to check (default: 1)

**Example**: `GET /api/products/65a1b2c3d4e5f6g7h8i9j0k1/stock/M?quantity=5`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "productName": "Classic Cotton T-Shirt",
    "size": "M",
    "availableStock": 15,
    "requestedQuantity": 5,
    "isAvailable": true
  }
}
```

---

## 🎟️ COUPONS API

### 1. Create Coupon
**POST** `/api/coupons`

**Request Body (Percentage Discount)**:
```json
{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "expiryDate": "2026-12-31",
  "isActive": true
}
```

**Request Body (Flat Discount)**:
```json
{
  "code": "FLAT100",
  "discountType": "flat",
  "discountValue": 100,
  "expiryDate": "2026-12-31",
  "isActive": true
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "...",
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    ...
  }
}
```

---

### 2. Get All Coupons
**GET** `/api/coupons`

**Query Parameters** (optional):
- `isActive` - Filter by active status (true/false)

**Example**: `GET /api/coupons?isActive=true`

**Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

### 3. Validate Coupon
**POST** `/api/coupons/validate`

**Request Body**:
```json
{
  "code": "SAVE20",
  "subtotal": 1000
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 200,
    "expiryDate": "2026-12-31T00:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

---

### 4. Update Coupon
**PUT** `/api/coupons/:id`

**Request Body** (all fields optional, code cannot be changed):
```json
{
  "discountValue": 25,
  "expiryDate": "2027-01-31",
  "isActive": false
}
```

---

### 5. Delete Coupon
**DELETE** `/api/coupons/:id`

**Response** (200):
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

## 📦 ORDERS API

### 1. Create Order (COD)
**POST** `/api/orders`

**Request Body**:
```json
{
  "customer": {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main Street, Mumbai, Maharashtra - 400001"
  },
  "items": [
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "size": "M",
      "quantity": 2
    },
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "size": "L",
      "quantity": 1
    }
  ],
  "couponCode": "SAVE20",
  "paymentMethod": "COD"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "...",
    "invoiceNumber": "INV-20260103-12345",
    "customer": {...},
    "items": [...],
    "subtotal": 1500,
    "discount": 300,
    "totalAmount": 1200,
    "couponCode": "SAVE20",
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "orderStatus": "PLACED",
    "createdAt": "2026-01-03T14:05:00.000Z"
  }
}
```

**Error Responses**:
```json
// Insufficient stock
{
  "success": false,
  "message": "Insufficient stock for Classic Cotton T-Shirt (Size: M). Available: 5"
}

// Invalid coupon
{
  "success": false,
  "message": "Invalid coupon code"
}
```

---

### 2. Get All Orders
**GET** `/api/orders`

**Query Parameters** (optional):
- `orderStatus` - Filter by order status (PLACED, CANCELLED)
- `paymentStatus` - Filter by payment status (PENDING, PAID, FAILED)
- `startDate` - Filter orders from this date (ISO format)
- `endDate` - Filter orders until this date (ISO format)

**Examples**:
- All orders: `GET /api/orders`
- Placed orders: `GET /api/orders?orderStatus=PLACED`
- Date range: `GET /api/orders?startDate=2026-01-01&endDate=2026-01-31`

**Response** (200):
```json
{
  "success": true,
  "count": 10,
  "summary": {
    "totalOrders": 10,
    "totalRevenue": 15000,
    "placedOrders": 8,
    "cancelledOrders": 2
  },
  "data": [...]
}
```

---

### 3. Get Order by ID
**GET** `/api/orders/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "invoiceNumber": "INV-20260103-12345",
    ...
  }
}
```

---

### 4. Get Order by Invoice Number
**GET** `/api/orders/invoice/:invoiceNumber`

**Example**: `GET /api/orders/invoice/INV-20260103-12345`

**Response** (200):
```json
{
  "success": true,
  "data": {...}
}
```

---

### 5. Update Order Status
**PUT** `/api/orders/:id/status`

**Request Body**:
```json
{
  "orderStatus": "CANCELLED",
  "paymentStatus": "PAID"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {...}
}
```

---

### 6. Cancel Order
**PUT** `/api/orders/:id/cancel`

**Response** (200):
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {...}
}
```

**Note**: Cancelling an order automatically restores the stock.

---

## 🏥 HEALTH CHECK

**GET** `/api/health`

**Response** (200):
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-01-03T14:05:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  }
}
```

---

## 🔧 Error Responses

All endpoints follow a consistent error response format:

**Validation Error** (400):
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Price must be greater than 0",
    "Please provide a product name"
  ]
}
```

**Not Found** (404):
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Server Error** (500):
```json
{
  "success": false,
  "message": "Internal Server Error",
  "stack": "..." // Only in development mode
}
```

---

## 📝 Testing Workflow

### Complete Order Flow Test:

1. **Create Products**:
   ```
   POST /api/products
   ```

2. **Create Coupon**:
   ```
   POST /api/coupons
   ```

3. **Validate Coupon**:
   ```
   POST /api/coupons/validate
   ```

4. **Check Stock**:
   ```
   GET /api/products/:id/stock/M?quantity=2
   ```

5. **Create Order**:
   ```
   POST /api/orders
   ```

6. **View All Orders**:
   ```
   GET /api/orders
   ```

7. **Track Order**:
   ```
   GET /api/orders/invoice/INV-20260103-12345
   ```

---

## 🎯 Postman Collection Tips

1. Create environment variables:
   - `base_url`: `http://localhost:5000`
   - `product_id`: Save from create product response
   - `order_id`: Save from create order response

2. Use Tests tab to auto-save IDs:
   ```javascript
   pm.environment.set("product_id", pm.response.json().data._id);
   ```

3. Import all endpoints and organize into folders:
   - Products
   - Coupons
   - Orders
   - Health

---

## ✅ Validation Rules Summary

### Products:
- Name: Required, max 100 chars
- Price: Required, > 0
- Category: Required, enum values
- Sizes: Integer, >= 0
- Images: Valid URL format

### Coupons:
- Code: Required, unique, 3-20 chars, uppercase
- Discount Type: flat or percentage
- Discount Value: > 0, percentage max 100
- Expiry Date: Must be in future

### Orders:
- Customer phone: 10 digits, starts with 6-9
- Items: At least 1 item required
- Size: S, M, L, or XL
- Quantity: Integer, >= 1
- Stock validation: Automatic
- Pricing: Server-side calculation only

---

**Server Status**: ✅ Running on http://localhost:5000
**Database**: ✅ MongoDB Connected
**Ready for Testing**: ✅ All endpoints operational
