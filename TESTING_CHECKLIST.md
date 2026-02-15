# 🧪 Rich Club E-Commerce - Testing Checklist

**Test Date:** 2026-02-15  
**Frontend URL:** http://localhost:3000  
**Backend URL:** https://richclub01.onrender.com/api/v1

---

## ✅ Test Checklist

### 1. ✅ Cart Shows Correct Breakdown

**Location:** `/cart` page  
**File:** `client/src/pages/public/CartPage.jsx`

#### What to Test:
- [ ] Navigate to http://localhost:3000/cart
- [ ] Add at least one product to cart
- [ ] Verify the following breakdown is displayed:

**Expected Breakdown:**
```
Product Cost:     ₹XXX  (calculated from total)
Tax (8%):         ₹XX   (8% of product cost)
Delivery Charges: ₹50   (fixed)
─────────────────────
Total:            ₹XXX  (Product + Tax + Delivery)
```

**Calculation Logic (Lines 46-52):**
```javascript
const total = getCartTotal(); // Admin-set total (e.g., ₹405)
const deliveryCharge = 50;
const taxRate = 0.08;
const amountWithoutDelivery = total - deliveryCharge; // 355
const productCost = Math.round(amountWithoutDelivery / (1 + taxRate)); // 329
const taxAmount = Math.round(amountWithoutDelivery - productCost); // 26
```

**Test Steps:**
1. Add product to cart
2. Go to cart page
3. Check "Order Summary" section on right side
4. Verify all 4 rows are displayed:
   - Product Cost
   - Tax (8%)
   - Delivery Charges
   - Total
5. Verify math: Product Cost + Tax + Delivery = Total

**Pass Criteria:** ✅ All breakdown items visible and calculations are correct

---

### 2. ✅ Checkout Shows Correct Breakdown

**Location:** `/checkout` page  
**File:** `client/src/pages/public/CheckoutPage.jsx`

#### What to Test:
- [ ] Navigate to http://localhost:3000/checkout (with items in cart)
- [ ] Verify the "Order Summary" section shows:

**Expected Breakdown (Without Coupon):**
```
[Product Images with Size/Qty]

Product Cost:     ₹XXX
Tax (8%):         ₹XX
Delivery Charges: ₹50
─────────────────────
Total:            ₹XXX
```

**Expected Breakdown (With Coupon):**
```
[Product Images with Size/Qty]

Product Cost:     ₹XXX
Discount (CODE):  -₹XX
Tax (8%):         ₹XX
Delivery Charges: ₹50
─────────────────────
Total:            ₹XXX
```

**Test Steps:**
1. Add items to cart
2. Go to checkout page
3. Verify "Order Summary" section (right side)
4. Check all cart items are listed with images
5. Verify price breakdown matches cart page
6. **Test Coupon:**
   - Enter a coupon code (if available)
   - Click "Apply"
   - Verify discount row appears
   - Verify total is reduced by discount amount
   - Verify product cost and tax are recalculated
   - Click "Remove" to remove coupon
   - Verify breakdown returns to original

**Calculation Logic (Lines 36-51):**
```javascript
// Without coupon
const total = getCartTotal();
const deliveryCharge = 50;
const taxRate = 0.08;
const amountWithoutDelivery = total - deliveryCharge;
const productCost = Math.round(amountWithoutDelivery / (1 + taxRate));
const taxAmount = Math.round(amountWithoutDelivery - productCost);

// With coupon
const discount = appliedCoupon?.discountAmount || 0;
const finalTotal = total - discount;
const finalAmountWithoutDelivery = finalTotal - deliveryCharge;
const finalProductCost = Math.round(finalAmountWithoutDelivery / (1 + taxRate));
const finalTaxAmount = Math.round(finalAmountWithoutDelivery - finalProductCost);
```

**Pass Criteria:** 
- ✅ All breakdown items visible
- ✅ Calculations are correct
- ✅ Coupon apply/remove works
- ✅ Discount is reflected in total

---

### 3. ✅ Share Button Works on Mobile/Desktop

**Location:** Product cards on `/shop` and `/` pages  
**File:** `client/src/components/ProductCard.jsx`

#### What to Test:

**Desktop Test:**
- [ ] Open http://localhost:3000/shop in desktop browser
- [ ] Find a product card
- [ ] Click the "Share" button (Share2 icon)
- [ ] **Expected:** Link copied to clipboard
- [ ] **Verify:** Alert shows "Link copied to clipboard!"
- [ ] Paste the link in a new tab
- [ ] **Verify:** Link opens the product detail page

**Mobile Test (or Simulate):**
- [ ] Open http://localhost:3000/shop on mobile device
- [ ] OR use Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Click "Share" button
- [ ] **Expected:** Native share sheet opens (if supported)
- [ ] **Verify:** Can share via WhatsApp, SMS, etc.
- [ ] **Fallback:** If not supported, link is copied to clipboard

**Share Logic (Lines 46-71):**
```javascript
const handleShare = async (e) => {
    const productUrl = `${window.location.origin}/product/${product._id}`;
    const shareData = {
        title: product.name,
        text: `Check out ${product.name} for ${formatPrice(product.price?.selling)}`,
        url: productUrl
    };

    if (navigator.share) {
        // Mobile: Native share
        await navigator.share(shareData);
    } else {
        // Desktop: Copy to clipboard
        await navigator.clipboard.writeText(productUrl);
        alert('Link copied to clipboard!');
    }
};
```

**Test Steps:**
1. Go to shop page
2. Find any product
3. Click "Share" button
4. **Desktop:** Verify alert and clipboard
5. **Mobile:** Verify native share sheet
6. Test the shared link works

**Pass Criteria:**
- ✅ Desktop: Link copied to clipboard
- ✅ Mobile: Native share sheet opens
- ✅ Shared link opens correct product page

---

### 4. ✅ Order IDs are Sequential

**Location:** Backend order creation  
**File:** `server/utils/invoiceGenerator.js`

#### What to Test:
- [ ] Create multiple test orders
- [ ] Verify invoice numbers are sequential

**Expected Format:**
```
RC-YYYYMMDD-XXXX
```

**Examples:**
```
RC-20260215-0001  (First order of the day)
RC-20260215-0002  (Second order)
RC-20260215-0003  (Third order)
RC-20260216-0001  (First order next day - resets)
```

**Sequential Logic (Lines 14-39):**
```javascript
const generateUniqueOrderId = async (OrderModel) => {
    const datePrefix = `RC-${year}${month}${day}`;
    
    // Find last order with same date prefix
    const lastOrder = await OrderModel.findOne({
        invoiceNumber: { $regex: `^${datePrefix}` }
    }).sort({ invoiceNumber: -1 });
    
    let nextSequence = 1;
    
    if (lastOrder && lastOrder.invoiceNumber) {
        const parts = lastOrder.invoiceNumber.split('-');
        const lastSuffix = parts[parts.length - 1];
        const lastSeqInt = parseInt(lastSuffix, 10);
        
        if (!isNaN(lastSeqInt)) {
            nextSequence = lastSeqInt + 1;
        }
    }
    
    const nextSuffix = String(nextSequence).padStart(4, '0');
    return `${datePrefix}-${nextSuffix}`;
};
```

**Test Steps:**
1. Create first order → Note invoice number (e.g., RC-20260215-0001)
2. Create second order → Verify it's RC-20260215-0002
3. Create third order → Verify it's RC-20260215-0003
4. Check admin panel → Verify all orders show sequential IDs
5. **Edge Case:** Create order tomorrow → Verify it resets to 0001

**How to Create Test Orders:**
1. Add product to cart
2. Go to checkout
3. Fill in delivery details:
   - Name: Test User
   - Phone: 9876543210
   - Address: Test Address
4. Click "Pay Now"
5. **Note:** Payment will open Razorpay (production)
6. Cancel payment or use test card if available
7. Check order ID in database or admin panel

**Pass Criteria:**
- ✅ First order of day starts at 0001
- ✅ Each subsequent order increments by 1
- ✅ Format is RC-YYYYMMDD-XXXX
- ✅ Sequence resets daily

---

### 5. ✅ Thank You Page Displays Order ID

**Location:** `/thank-you` page  
**File:** `client/src/pages/public/ThankYouPage.jsx`

#### What to Test:
- [ ] Complete a successful order
- [ ] Verify Thank You page displays Order ID

**Expected Display:**
```
🎉 Order Confirmed!

Your order has been placed successfully.

┌─────────────────────────┐
│  Your Order ID          │
│  RC-20260215-0001       │ ← Large, prominent display
│  [Copy Order ID]        │ ← Copy button
└─────────────────────────┘

⚠️ Please save or screenshot this Order ID.
You will need it to track your order.
```

**Order ID Display (Lines 34-49):**
```jsx
<div className="order-id-highlight">
    <p className="order-id-label">Your Order ID</p>
    <h2 className="order-id-value">{invoiceNumber}</h2>
    <button 
        className="btn-copy-order-id"
        onClick={() => {
            navigator.clipboard.writeText(invoiceNumber);
            alert('Order ID copied!');
        }}
    >
        Copy Order ID
    </button>
    <p className="order-id-note">
        ⚠️ Please save or screenshot this Order ID. 
        You will need it to track your order.
    </p>
</div>
```

**Test Steps:**
1. Complete a full order (add to cart → checkout → pay)
2. After successful payment, verify redirect to Thank You page
3. Check Order ID is displayed prominently
4. Verify format: RC-YYYYMMDD-XXXX
5. Verify warning message is shown
6. Click "Copy Order ID" button (test in next section)

**Pass Criteria:**
- ✅ Order ID is displayed in large text
- ✅ Format is correct (RC-YYYYMMDD-XXXX)
- ✅ Warning message is visible
- ✅ Copy button is present

---

### 6. ✅ Copy Button Works

**Location:** Thank You page  
**File:** `client/src/pages/public/ThankYouPage.jsx`

#### What to Test:
- [ ] Click "Copy Order ID" button
- [ ] Verify order ID is copied to clipboard
- [ ] Verify alert confirmation

**Copy Logic (Lines 37-45):**
```jsx
<button 
    className="btn-copy-order-id"
    onClick={() => {
        navigator.clipboard.writeText(invoiceNumber);
        alert('Order ID copied!');
    }}
>
    Copy Order ID
</button>
```

**Test Steps:**
1. On Thank You page, click "Copy Order ID" button
2. **Verify:** Alert shows "Order ID copied!"
3. Open a text editor or notepad
4. Paste (Ctrl+V or Cmd+V)
5. **Verify:** Pasted text matches the displayed Order ID
6. **Verify:** Format is RC-YYYYMMDD-XXXX

**Browser Compatibility Test:**
- [ ] Chrome: Copy works
- [ ] Firefox: Copy works
- [ ] Safari: Copy works
- [ ] Edge: Copy works
- [ ] Mobile Chrome: Copy works
- [ ] Mobile Safari: Copy works

**Pass Criteria:**
- ✅ Click triggers clipboard copy
- ✅ Alert confirmation appears
- ✅ Pasted text matches Order ID
- ✅ Works on all major browsers

---

## 📊 Additional Tests to Consider

### Order Confirmation Page
**Location:** `/order/:id`  
**File:** `client/src/pages/public/OrderConfirmationPage.jsx`

- [ ] Navigate to order confirmation page
- [ ] Verify Order ID is displayed as `Order #RC-YYYYMMDD-XXXX`
- [ ] Verify order summary shows:
  - Items with size and quantity
  - Subtotal
  - Discount (if coupon applied)
  - Total
- [ ] Verify delivery address is shown
- [ ] Verify payment status badge
- [ ] Verify order status badge

### Admin Panel
- [ ] Login to admin panel
- [ ] Go to Orders section
- [ ] Verify orders are listed with invoice numbers
- [ ] Verify invoice numbers are sequential
- [ ] Check order details show correct breakdown

---

## 🐛 Known Issues to Watch For

### Cart Breakdown
- ❌ Tax calculation rounding errors
- ❌ Delivery charge not added to total
- ❌ Product cost calculation incorrect

### Checkout Breakdown
- ❌ Coupon discount not applied to total
- ❌ Tax not recalculated after coupon
- ❌ Breakdown doesn't match cart page

### Share Button
- ❌ Share button not visible on mobile
- ❌ Clipboard API not supported in older browsers
- ❌ Shared link is incorrect or broken

### Order IDs
- ❌ Duplicate order IDs generated
- ❌ Sequence doesn't increment
- ❌ Format is incorrect
- ❌ Sequence doesn't reset daily

### Thank You Page
- ❌ Order ID not displayed
- ❌ Redirects to home instead of Thank You page
- ❌ Order ID format is wrong

### Copy Button
- ❌ Copy doesn't work
- ❌ No confirmation alert
- ❌ Copies wrong text

---

## 📝 Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

### 1. Cart Breakdown
- Status: ✅ PASS / ❌ FAIL
- Notes: 
- Screenshot: 

### 2. Checkout Breakdown
- Status: ✅ PASS / ❌ FAIL
- Coupon Test: ✅ PASS / ❌ FAIL
- Notes: 
- Screenshot: 

### 3. Share Button
- Desktop: ✅ PASS / ❌ FAIL
- Mobile: ✅ PASS / ❌ FAIL
- Notes: 
- Screenshot: 

### 4. Sequential Order IDs
- First Order: RC-YYYYMMDD-XXXX
- Second Order: RC-YYYYMMDD-XXXX
- Third Order: RC-YYYYMMDD-XXXX
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### 5. Thank You Page Order ID
- Status: ✅ PASS / ❌ FAIL
- Order ID Displayed: RC-YYYYMMDD-XXXX
- Notes: 
- Screenshot: 

### 6. Copy Button
- Status: ✅ PASS / ❌ FAIL
- Browsers Tested: Chrome, Firefox, Safari, Edge
- Notes: 
```

---

## 🚀 Quick Test Flow

**End-to-End Test (15 minutes):**

1. **Browse Products** (2 min)
   - Go to http://localhost:3000/shop
   - Click on a product
   - Click "Share" button → Test share functionality ✅

2. **Add to Cart** (2 min)
   - Select size
   - Click "Add to Cart"
   - Go to cart page
   - Verify cart breakdown ✅

3. **Checkout** (3 min)
   - Click "Proceed to Checkout"
   - Verify checkout breakdown ✅
   - Test coupon (if available) ✅
   - Fill in delivery details

4. **Payment** (5 min)
   - Click "Pay Now"
   - Note the Order ID format
   - Complete or cancel payment
   - If successful, proceed to Thank You page

5. **Thank You Page** (3 min)
   - Verify Order ID is displayed ✅
   - Note the Order ID (e.g., RC-20260215-0001)
   - Click "Copy Order ID" ✅
   - Paste in notepad to verify

6. **Repeat** (Optional)
   - Create another order
   - Verify Order ID increments (e.g., RC-20260215-0002) ✅

---

## 📸 Screenshots to Capture

1. Cart page showing breakdown
2. Checkout page showing breakdown
3. Checkout page with coupon applied
4. Share button on product card
5. Native share sheet (mobile)
6. Thank You page with Order ID
7. Clipboard paste showing copied Order ID
8. Admin panel showing sequential order IDs

---

## ✅ Final Checklist

- [ ] All 6 test items completed
- [ ] Screenshots captured
- [ ] Issues documented
- [ ] Test results recorded
- [ ] Edge cases tested
- [ ] Mobile and desktop tested
- [ ] Multiple browsers tested

---

**Testing Status:** 🟡 Pending Manual Testing  
**Last Updated:** 2026-02-15 09:45 IST  
**Tester:** [Your Name]
