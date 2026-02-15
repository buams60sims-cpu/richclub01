# 🧪 Quick Test Reference

## Test URLs
- **Frontend:** http://localhost:3000
- **Shop Page:** http://localhost:3000/shop
- **Cart:** http://localhost:3000/cart
- **Checkout:** http://localhost:3000/checkout

---

## ✅ 6 Critical Tests

### 1. Cart Breakdown ✅
**URL:** `/cart`  
**Check:**
- Product Cost: ₹XXX
- Tax (8%): ₹XX
- Delivery Charges: ₹50
- Total: ₹XXX

### 2. Checkout Breakdown ✅
**URL:** `/checkout`  
**Check:**
- Same breakdown as cart
- Coupon apply/remove works
- Discount reflected in total

### 3. Share Button ✅
**URL:** `/shop` (product cards)  
**Desktop:** Link copied to clipboard  
**Mobile:** Native share sheet opens

### 4. Sequential Order IDs ✅
**Format:** `RC-YYYYMMDD-XXXX`  
**Test:** Create 3 orders, verify:
- RC-20260215-0001
- RC-20260215-0002
- RC-20260215-0003

### 5. Thank You Page Order ID ✅
**URL:** `/thank-you` (after payment)  
**Check:**
- Order ID displayed prominently
- Format: RC-YYYYMMDD-XXXX
- Warning message shown

### 6. Copy Button ✅
**URL:** `/thank-you`  
**Check:**
- Click "Copy Order ID"
- Alert shows "Order ID copied!"
- Paste works correctly

---

## 🚀 15-Minute Test Flow

1. Browse → Share product (2 min)
2. Add to cart → Check breakdown (2 min)
3. Checkout → Check breakdown + coupon (3 min)
4. Payment → Note Order ID (5 min)
5. Thank You → Copy Order ID (3 min)
6. Repeat → Verify sequential ID (optional)

---

## 📋 Quick Pass/Fail

```
[ ] Cart breakdown correct
[ ] Checkout breakdown correct
[ ] Share button works (desktop)
[ ] Share button works (mobile)
[ ] Order IDs sequential
[ ] Thank You page shows Order ID
[ ] Copy button works
```

---

## 🐛 Common Issues

- Tax calculation rounding
- Coupon not applied
- Share button missing on mobile
- Duplicate Order IDs
- Copy button doesn't work
- Order ID not displayed

---

**Full Details:** See `TESTING_CHECKLIST.md`
