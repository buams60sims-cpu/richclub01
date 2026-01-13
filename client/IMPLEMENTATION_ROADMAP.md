# Rich Club Frontend - Implementation Roadmap

## ✅ COMPLETED

### Foundation (100%)
- [x] Project structure with Vite + React
- [x] Global design system (index.css) with exact color tokens
- [x] Typography system (Playfair Display + Inter)
- [x] Spacing rules (8px, 16px, 24px, 32px, 48px)
- [x] Button, Form, Card, Badge systems
- [x] Axios API client with interceptors
- [x] API service layer (all backend endpoints)
- [x] Utility helpers (formatting, validation, calculations)
- [x] Auth Context (login/logout/admin check)
- [x] Cart Context (add/remove/update with localStorage)

## 🚧 IN PROGRESS

### Core Components
- [ ] App.jsx with React Router setup
- [ ] Header component (logo + nav)
- [ ] Footer component
- [ ] ProtectedRoute component for admin
- [ ] Loading spinner component
- [ ] Modal component (for admin actions)

### Public Pages
- [ ] Home Page (/)
  - [ ] Hero Banner (full-width, dark overlay, CTA visible)
  - [ ] Editor's Picks (grid layout, lazy-loaded images)
  - [ ] Custom Design Banner
  - [ ] Product Categories section
  - [ ] Trust Section (USP badges)
- [ ] Shop Page (/shop)
  - [ ] Category tabs (NOT dropdown)
  - [ ] Product grid (desktop 4 / tablet 2 / mobile 1)
  - [ ] Product cards (image, name, price, discount, Add to Cart button ALWAYS visible)
  - [ ] Empty state
- [ ] Product Details (/product/:id)
  - [ ] Image gallery with thumbnails
  - [ ] Sticky product info (desktop ≥ 993px)
  - [ ] Size selection (mandatory)
  - [ ] Stock-aware quantity control
  - [ ] Accordion for description
- [ ] Cart Page (/cart)
  - [ ] Editable quantities
  - [ ] Remove item
  - [ ] Real-time price recalculation
  - [ ] Empty cart UI
  - [ ] Proceed to Checkout CTA
- [ ] Checkout Page (/checkout)
  - [ ] Delivery information form
  - [ ] Sticky order summary (desktop)
  - [ ] Coupon input with backend validation
  - [ ] Razorpay integration (Pay Now CTA)
- [ ] Order Confirmation (/order/:id)
  - [ ] Invoice summary
  - [ ] Payment status
  - [ ] Delivery address
  - [ ] Items list

### Auth Pages
- [ ] Login Page (/login)
  - [ ] Admin login via email/password
  - [ ] Clear error handling
  - [ ] No UI leaks of admin routes

### Admin Panel
- [ ] Admin Layout (sidebar + main content)
- [ ] Dashboard (/admin)
  - [ ] Total Orders, Revenue, Active Products, Active Coupons
  - [ ] Order Status Breakdown
  - [ ] Inventory Intelligence Table
  - [ ] Action Required Table
  - [ ] Send Daily Summary button
- [ ] Products (/admin/products)
  - [ ] Table with thumbnail (56px max), name (ellipsis), category, price, stock, status, actions
  - [ ] Long names truncate
- [ ] Add/Edit Product (/admin/products/new, /admin/products/:id)
  - [ ] Two-column desktop layout
  - [ ] Image management (preview, upload, max 8 enforced)
  - [ ] Size-based stock grid
  - [ ] Total stock auto-calculated
- [ ] Orders (/admin/orders)
  - [ ] Status badges (human-readable)
  - [ ] View order modal (centered overlay)
  - [ ] Admin remarks editable
- [ ] Coupons (/admin/coupons)
  - [ ] Create coupon modal (centered)
  - [ ] Type switch (percentage → %, flat → ₹)
  - [ ] Expiry date auto set to 23:59:59
  - [ ] Empty state UI
- [ ] Home Content CMS (/admin/home-content)
  - [ ] Tabs: Hero / Lookbook / Sections
  - [ ] Image grid with numbering
  - [ ] Disable/enable sections
  - [ ] Padding consistency

## 📋 QUALITY CHECKLIST

### Non-Negotiable
- [ ] No console errors
- [ ] No layout jump on load
- [ ] No hover-only interactions for critical actions
- [ ] No hardcoded strings for statuses (use helpers)
- [ ] All buttons visible by default
- [ ] All dialogs are modals (not inline)
- [ ] Desktop-first layouts
- [ ] Mobile responsive without breaking desktop

### Design System Compliance
- [ ] Only use spacing: 8px, 16px, 24px, 32px, 48px
- [ ] Headings use Playfair Display
- [ ] Body text uses Inter
- [ ] Colors match exact tokens (--black, --white, --gold, --gray-*)
- [ ] Desktop container max-width: 1200px
- [ ] Admin container max-width: 1400px

## 🎯 NEXT STEPS

1. Create App.jsx with routing
2. Build Header and Footer
3. Implement Home Page
4. Build Shop Page
5. Create Product Details Page
6. Implement Cart and Checkout
7. Build Admin Panel
8. Polish and test

## 📝 NOTES

- Backend is FINAL - match APIs exactly
- No guessing, no inventing fields
- Desktop-first, then responsive
- This is client-ready, not student project
