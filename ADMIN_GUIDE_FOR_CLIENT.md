# 📖 Rich Club - Admin Panel Guide

**For:** Rich Club Admin/Owner  
**Version:** 1.0  
**Last Updated:** 2026-01-10

---

## 🔐 LOGIN CREDENTIALS

**Admin Panel URL:** https://yourwebsite.com/admin/login  
*(Replace with your actual domain)*

**Login Details:**
- **Email:** admin@richclub.com
- **Password:** [Provided separately for security]

⚠️ **IMPORTANT:** Keep these credentials secure. Do not share with unauthorized persons.

---

## 📦 HOW TO ADD NEW PRODUCTS

### Step 1: Login to Admin Panel
1. Go to admin panel URL
2. Enter your email and password
3. Click "Login"

### Step 2: Navigate to Products
1. Click "Products" in the sidebar
2. Click "Add Product" button

### Step 3: Fill Product Details

#### Basic Information:
- **Product Name:** Enter the product name (e.g., "Premium Oversize T-Shirt - Black")
- **Description:** Write a detailed description of the product
- **Category:** Select from dropdown:
  - Normal T-Shirts
  - Oversize T-Shirts
  - Collar T-Shirts
  - Hoodies

#### Pricing:
- **Original Price (₹):** Enter the MRP (Maximum Retail Price)
  - Example: 1999
- **Selling Price (₹):** Enter the price customer will pay
  - Example: 1299
- **Discount:** Automatically calculated and displayed
  - Example: "35% OFF - Customer saves ₹700"

💡 **Tip:** The system automatically calculates the discount percentage. You just enter the two prices!

#### Stock Management:
Enter available quantity for each size:
- **S (Small):** Number of items
- **M (Medium):** Number of items
- **L (Large):** Number of items
- **XL (Extra Large):** Number of items
- **XXL (Double XL):** Number of items

Example:
```
S: 10
M: 15
L: 12
XL: 8
XXL: 5
```

#### Product Images:
- Upload up to **4 images**
- First image is the main product image
- Additional images show in product gallery
- Recommended size: 500x500 pixels or larger
- Format: JPG or PNG

### Step 4: Create Product
1. Review all details
2. Click "Create Product" button
3. Product will appear in your shop immediately!

---

## ✏️ HOW TO EDIT PRODUCTS

### Step 1: Find the Product
1. Go to "Products" in admin panel
2. Find the product you want to edit
3. Click "Edit" button

### Step 2: Update Details
- Change any field you want to update
- Discount recalculates automatically when you change prices
- Update stock quantities as needed
- Replace images if needed

### Step 3: Save Changes
1. Click "Update Product" button
2. Changes appear on website immediately

---

## 🗑️ HOW TO DELETE PRODUCTS

### When to Delete:
- Product is discontinued
- Product is no longer available
- Wrong product was added

### How to Delete:
1. Go to "Products" in admin panel
2. Find the product to delete
3. Click "Delete" button
4. Confirm deletion when prompted
5. Product is **permanently removed** from database

⚠️ **WARNING:** Deletion is permanent and cannot be undone!

💡 **Tip:** If product is temporarily out of stock, set all sizes to 0 instead of deleting.

---

## 📋 HOW TO MANAGE ORDERS

### View All Orders
1. Click "Orders" in admin panel
2. See list of all customer orders
3. Orders show:
   - Order ID
   - Customer name
   - Order date
   - Total amount
   - Payment status
   - Order status

### View Order Details
1. Click on any order
2. See complete details:
   - Customer information (name, phone, address)
   - Items ordered (products, sizes, quantities)
   - Payment method
   - Total amount

### Update Order Status
1. Open order details
2. Change status dropdown:
   - **Pending:** Order just received
   - **Processing:** Order being prepared
   - **Shipped:** Order dispatched
   - **Delivered:** Order completed
3. Click "Update Status"
4. Customer sees updated status

### Order Workflow:
```
Pending → Processing → Shipped → Delivered
```

---

## 📊 UNDERSTANDING STOCK MANAGEMENT

### Stock Display on Website:

**When stock is high (> 5 items):**
- No special badge shown
- "Add to Bag" button active

**When stock is low (1-5 items):**
- Orange "Only few left" badge shows
- Creates urgency for customers
- "Add to Bag" button active

**When stock is zero (0 items):**
- Grey "Sold Out" badge shows
- "Add to Bag" button disabled
- Customers cannot purchase

### Stock Reduction:
- Stock automatically reduces when customer places order
- Example: 
  - Before order: M = 10
  - Customer orders 2 × M
  - After order: M = 8

### Restocking:
1. Edit the product
2. Update stock quantities
3. Save changes
4. Product available for purchase again

---

## 💰 PRICING STRATEGIES

### How Discounts Work:

**Example 1: Sale Item**
- Original Price: ₹1999
- Selling Price: ₹1299
- Discount: 35% OFF (automatically calculated)
- Customer sees: ~~₹1999~~ ₹1299 with "35% OFF" badge

**Example 2: Regular Price**
- Original Price: ₹1499
- Selling Price: ₹1499
- Discount: 0%
- Customer sees: ₹1499 (no discount badge)

### Best Practices:
- ✅ Set realistic original prices (actual MRP)
- ✅ Use discounts strategically for promotions
- ✅ Keep selling price competitive
- ✅ Update prices seasonally

---

## 🎨 PRODUCT IMAGE GUIDELINES

### Image Requirements:
- **Format:** JPG or PNG
- **Size:** Minimum 500x500 pixels
- **Aspect Ratio:** Square (1:1) recommended
- **File Size:** Under 2MB per image
- **Quality:** High resolution, clear product view

### Image Tips:
- ✅ Use white or neutral background
- ✅ Show product from multiple angles
- ✅ Include close-up details
- ✅ Use good lighting
- ✅ Keep images consistent across products

### Image Slots:
- **Image 1:** Main product image (front view)
- **Image 2:** Back view or alternate angle
- **Image 3:** Detail shot or lifestyle image
- **Image 4:** Additional view or packaging

---

## 🔍 COMMON TASKS

### Task 1: Add Seasonal Collection
1. Add new products with seasonal theme
2. Set attractive discounts (e.g., 20-30% OFF)
3. Update stock based on expected demand
4. Use high-quality seasonal images

### Task 2: Run a Sale
1. Edit products you want to discount
2. Lower the selling price
3. Discount badge updates automatically
4. Promote on social media

### Task 3: Restock Popular Items
1. Check which products are selling fast
2. Edit those products
3. Increase stock quantities
4. Save changes

### Task 4: Remove Old Products
1. Identify discontinued products
2. Delete permanently
3. Or set stock to 0 if might restock later

---

## ⚠️ IMPORTANT NOTES

### DO:
- ✅ Regularly update stock levels
- ✅ Respond to orders promptly
- ✅ Keep product descriptions accurate
- ✅ Use high-quality images
- ✅ Update order status as you process them

### DON'T:
- ❌ Delete products that have existing orders
- ❌ Set unrealistic original prices
- ❌ Leave orders in "Pending" status too long
- ❌ Use low-quality or blurry images
- ❌ Forget to update stock after manual sales

---

## 🆘 TROUBLESHOOTING

### Problem: Can't Login
**Solution:**
- Check email and password are correct
- Ensure caps lock is off
- Contact technical support if issue persists

### Problem: Product Not Showing on Website
**Solution:**
- Verify product was saved successfully
- Check if stock is set to 0 (won't show if sold out)
- Refresh the shop page
- Clear browser cache

### Problem: Discount Not Calculating
**Solution:**
- Ensure selling price is less than original price
- Save the product
- Refresh the page

### Problem: Image Not Uploading
**Solution:**
- Check file size (must be under 2MB)
- Ensure file is JPG or PNG format
- Try a different image
- Contact technical support if issue persists

---

## 📞 TECHNICAL SUPPORT

**For technical issues or questions:**

**Email:** [your-support-email@example.com]  
**Phone:** [your-support-phone]  
**Response Time:** Within 24 hours

**Include in your support request:**
- Description of the issue
- Screenshots if possible
- Steps you took before the issue occurred
- Your admin email (for verification)

---

## 📈 TIPS FOR SUCCESS

### Inventory Management:
- Update stock weekly
- Track which products sell fastest
- Restock popular items before they run out
- Remove slow-moving products

### Pricing Strategy:
- Research competitor prices
- Use discounts strategically
- Offer seasonal promotions
- Keep prices competitive

### Order Processing:
- Process orders within 24 hours
- Update order status regularly
- Communicate with customers
- Maintain order records

### Product Presentation:
- Write detailed descriptions
- Use professional images
- Highlight unique features
- Keep information accurate

---

## ✅ QUICK REFERENCE

| Task | Steps |
|------|-------|
| **Add Product** | Products → Add Product → Fill details → Create |
| **Edit Product** | Products → Find product → Edit → Update |
| **Delete Product** | Products → Find product → Delete → Confirm |
| **View Orders** | Orders → Click order for details |
| **Update Order Status** | Orders → Open order → Change status → Update |
| **Restock Product** | Products → Edit → Update stock → Save |

---

## 🎯 DAILY CHECKLIST

**Every Day:**
- [ ] Check new orders
- [ ] Update order statuses
- [ ] Respond to customer inquiries
- [ ] Monitor stock levels

**Every Week:**
- [ ] Review inventory
- [ ] Restock popular items
- [ ] Check for low stock items
- [ ] Review pricing strategy

**Every Month:**
- [ ] Analyze sales data
- [ ] Remove slow-moving products
- [ ] Plan seasonal promotions
- [ ] Update product images if needed

---

**This guide will help you manage your Rich Club store efficiently. For any questions, contact technical support.**

**Happy Selling! 🎉**
