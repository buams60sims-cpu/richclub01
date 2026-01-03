# Razorpay Payment Integration Documentation

## ✅ Razorpay Online Payment Complete

Razorpay payment gateway has been successfully integrated **WITHOUT breaking the existing COD flow**.

---

## 🔄 Payment Flow

### **COD Flow** (Unchanged)
1. Customer creates order via `POST /api/orders`
2. `paymentMethod: "COD"`
3. `paymentStatus: "PENDING"`
4. Order placed successfully

### **Razorpay Flow** (New)
1. Customer creates order via `POST /api/orders`
2. `paymentMethod: "COD"` (initially)
3. Frontend calls `POST /api/payments/create-order` with `orderId`
4. Server creates Razorpay order (server-side amount)
5. Frontend shows Razorpay checkout
6. Customer completes payment
7. Frontend calls `POST /api/payments/verify` with payment details
8. Server verifies signature
9. Order updated: `paymentStatus: "PAID"`, `paymentMethod: "RAZORPAY"`

---

## 📝 API Endpoints

### 1. Create Razorpay Order
**POST** `/api/payments/create-order`

**Request Body**:
```json
{
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "razorpayOrderId": "order_MNOPqrstuvwxyz",
    "amount": 120000,
    "currency": "INR",
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "invoiceNumber": "INV-20260103-12345",
    "keyId": "rzp_test_xxxxxxxxxx"
  }
}
```

**Error Responses**:
```json
// Order not found (404)
{
  "success": false,
  "message": "Order not found"
}

// Payment already initiated (400)
{
  "success": false,
  "message": "Payment already initiated for this order",
  "razorpayOrderId": "order_MNOPqrstuvwxyz"
}

// Order already paid (400)
{
  "success": false,
  "message": "Order is already paid"
}

// Order cancelled (400)
{
  "success": false,
  "message": "Cannot process payment for cancelled order"
}
```

---

### 2. Verify Payment
**POST** `/api/payments/verify`

**Request Body**:
```json
{
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "razorpayOrderId": "order_MNOPqrstuvwxyz",
  "razorpayPaymentId": "pay_ABCDefghijklmn",
  "razorpaySignature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "invoiceNumber": "INV-20260103-12345",
    "paymentStatus": "PAID",
    "totalAmount": 1200
  }
}
```

**Error Responses**:
```json
// Invalid signature (400)
{
  "success": false,
  "message": "Payment verification failed. Invalid signature."
}

// Order ID mismatch (400)
{
  "success": false,
  "message": "Razorpay order ID mismatch"
}

// Already verified (400)
{
  "success": false,
  "message": "Payment already verified for this order"
}
```

---

### 3. Get Razorpay Key
**GET** `/api/payments/razorpay-key`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "keyId": "rzp_test_xxxxxxxxxx"
  }
}
```

---

## 🔒 Security Features

### Server-Side Amount Calculation
- ✅ **Never trusts frontend amount**
- ✅ Uses `order.totalAmount` from database
- ✅ Converts to paise (₹1 = 100 paise)
- ✅ Prevents amount manipulation

### Signature Verification
- ✅ Uses crypto HMAC SHA256
- ✅ Verifies: `razorpayOrderId|razorpayPaymentId`
- ✅ Compares with Razorpay signature
- ✅ Marks payment as FAILED if signature mismatch

### Duplicate Payment Prevention
- ✅ Checks if `razorpayOrderId` already exists
- ✅ Checks if payment already completed
- ✅ Prevents double charging

### Order Status Validation
- ✅ Cannot pay for cancelled orders
- ✅ Cannot re-verify paid orders
- ✅ Proper error messages

---

## 🗄️ Database Schema Updates

### Order Model - New Fields:
```javascript
{
  // ... existing fields ...
  
  // Razorpay payment tracking
  razorpayOrderId: String,      // Razorpay order ID
  razorpayPaymentId: String,    // Razorpay payment ID
  razorpaySignature: String     // Payment signature
}
```

---

## 🧪 Testing with Postman

### Step 1: Create Order (COD)
```http
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

**Save the `orderId` from response**

---

### Step 2: Create Razorpay Order
```http
POST http://localhost:5000/api/payments/create-order
Content-Type: application/json

{
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Save the `razorpayOrderId` and `keyId`**

---

### Step 3: Simulate Payment (Frontend)
In a real scenario, frontend would:
```javascript
const options = {
  key: data.keyId,
  amount: data.amount,
  currency: data.currency,
  order_id: data.razorpayOrderId,
  handler: function(response) {
    // Send to verify endpoint
    verifyPayment({
      orderId: data.orderId,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    });
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

### Step 4: Verify Payment
```http
POST http://localhost:5000/api/payments/verify
Content-Type: application/json

{
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "razorpayOrderId": "order_MNOPqrstuvwxyz",
  "razorpayPaymentId": "pay_ABCDefghijklmn",
  "razorpaySignature": "generated_signature_from_razorpay"
}
```

---

## ⚙️ Environment Setup

### Required Environment Variables:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

### Getting Razorpay Credentials:
1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Key Secret
5. Add to `.env` file

---

## 🔧 Testing with Razorpay Test Mode

### Test Card Details:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Test UPI:
- **UPI ID**: success@razorpay

### Test Netbanking:
- Select any bank
- Use credentials provided by Razorpay

---

## 📊 Payment Status Flow

```
Order Created (COD)
    ↓
paymentStatus: PENDING
paymentMethod: COD
    ↓
Create Razorpay Order
    ↓
razorpayOrderId saved
paymentMethod: RAZORPAY
    ↓
Customer Pays
    ↓
Verify Signature
    ↓
    ├─ Success → paymentStatus: PAID
    └─ Failure → paymentStatus: FAILED
```

---

## ✅ Implementation Checklist

- ✅ Razorpay SDK installed
- ✅ Environment variables configured
- ✅ Order model updated with Razorpay fields
- ✅ Razorpay configuration file
- ✅ Payment controller with create & verify
- ✅ Payment routes (all public)
- ✅ Server-side amount calculation
- ✅ Signature verification with crypto
- ✅ Duplicate payment prevention
- ✅ Order status validation
- ✅ Error handling
- ✅ COD flow unchanged
- ✅ Routes registered in server
- ✅ API documentation updated

---

## 🚨 Error Handling

### Signature Verification Failed:
- Payment marked as `FAILED`
- Razorpay details saved for audit
- Clear error message returned
- No stock restoration (order still exists)

### Payment Already Initiated:
- Returns existing Razorpay order ID
- Prevents duplicate Razorpay orders
- Customer can retry with same order

### Order Not Found:
- 404 error
- Clear message
- No Razorpay order created

---

## 🎯 Key Features

1. **COD Still Works**: Existing COD flow completely unchanged
2. **Server-Side Security**: Amount calculated on server, never trust frontend
3. **Signature Verification**: Crypto-based verification prevents fraud
4. **Duplicate Prevention**: Cannot create multiple Razorpay orders for same order
5. **Audit Trail**: All Razorpay IDs saved in database
6. **Public Routes**: No authentication required for payment endpoints
7. **Graceful Errors**: Clear error messages for all scenarios

---

## 📁 Files Created/Modified

### New Files (3):
1. `server/config/razorpay.js` - Razorpay SDK configuration
2. `server/controllers/paymentController.js` - Payment logic
3. `server/routes/paymentRoutes.js` - Payment endpoints

### Modified Files (3):
1. `server/models/Order.js` - Added Razorpay fields
2. `server/.env.example` - Added Razorpay credentials
3. `server/server.js` - Registered payment routes

---

## 🔄 Complete Order Flow Example

### Scenario: Customer orders ₹1,200 worth of products

1. **Create Order**:
   ```
   POST /api/orders
   → Order created with totalAmount: 1200
   → paymentMethod: COD
   → paymentStatus: PENDING
   ```

2. **Initiate Payment**:
   ```
   POST /api/payments/create-order
   → Razorpay order created with amount: 120000 (paise)
   → razorpayOrderId: order_ABC123
   → paymentMethod updated to: RAZORPAY
   ```

3. **Customer Pays** (Frontend):
   ```
   Razorpay checkout opens
   → Customer enters card details
   → Payment successful
   → Razorpay returns: paymentId, signature
   ```

4. **Verify Payment**:
   ```
   POST /api/payments/verify
   → Signature verified ✅
   → paymentStatus updated to: PAID
   → razorpayPaymentId saved
   → razorpaySignature saved
   ```

5. **Order Complete**:
   ```
   Order status: PLACED
   Payment status: PAID
   Payment method: RAZORPAY
   Total amount: 1200
   ```

---

## 🚀 Next Steps

1. ✅ Test with Razorpay test credentials
2. ✅ Test COD flow (ensure unchanged)
3. ✅ Test payment verification
4. ✅ Test error scenarios
5. ⏭️ Integrate with frontend
6. ⏭️ Add webhook for payment updates (optional)
7. ⏭️ Switch to live keys for production

---

## 🎉 Implementation Complete!

**Status**: ✅ FULLY IMPLEMENTED  
**Breaking Changes**: ❌ NONE (COD still works)  
**Testing**: ✅ READY  
**Security**: ✅ SERVER-SIDE VERIFICATION  
**Documentation**: ✅ COMPREHENSIVE  

Razorpay payment integration is production-ready and can be tested immediately!
