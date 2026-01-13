# 🚀 MERN Developer Execution Plan (Rich Club)
**Duration:** 15–18 Days | **Internal Use Only**

## 🛠️ TECH STACK
### Frontend
- **Framework:** React + Vite
- **Styling:** CSS / SCSS (Vanilla Architecture)
- **Animations:** 
  - Framer Motion (Primary UI & Page Transitions)
  - GSAP (High-impact Hero / Banner sections only)

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB (Atlas / Local)
- **Auth:** JWT (Admin role-based access)
- **Payments:** Razorpay SDK

---

## 📂 PROJECT STRUCTURE
### Frontend (`/client`)
```text
client/
 ├─ src/
 │  ├─ components/     # Reusable UI elements
 │  ├─ pages/          # View components
 │  ├─ layouts/        # Page wrappers (AdminLayout, MainLayout)
 │  ├─ animations/     # Framer Motion variants & GSAP configs
 │  ├─ hooks/          # Custom React hooks (useAuth, useCart)
 │  ├─ services/       # API abstraction (api.js)
 │  ├─ context/        # Global state (Auth, Cart)
 │  ├─ styles/         # Global & component-specific CSS
 │  └─ utils/          # Formatters, helpers
```

### Backend (`/server`)
```text
server/
 ├─ controllers/       # Business logic handlers
 ├─ models/            # Mongoose schemas
 ├─ routes/            # Express route definitions
 ├─ middlewares/       # Auth, Admin validation, Uploads
 ├─ utils/             # Invoice generators, WhatsApp formatters
 ├─ config/            # DB connection, Cloudinary/Razorpay config
 └─ server.js          # Entry point
```

---

## 📅 DAY-WISE EXECUTION

### PHASE 1: FOUNDATION (DAYS 1-5)
- **DAY 1:** Project Initialization (Vite, Express, MongoDB setup, Boilerplate).
- **DAY 2:** Database Models (Product sizes/stock, Order, Coupon, Admin User).
- **DAY 3:** Admin Auth & Product APIs (JWT Login, CRUD, Inventory logic).
- **DAY 4:** Order & Payment Logic (Invoice entry, Razorpay integration, COD handling).
- **DAY 5:** Coupon & WhatsApp Logic (Validation, WhatsApp message generator).

### PHASE 2: FRONTEND CORE (DAYS 6-11)
- **DAY 6:** Frontend Design System (Global tokens, typography, reusable components).
- **DAY 7:** Home Page (Hero banners, Featured products, GSAP entry animations).
- **DAY 8:** Shop Page (Product grid, Skeleton loaders, Filtering).
- **DAY 9:** Product Details Page (Size selection, Stock validation, Add-to-cart).
- **DAY 10:** Cart & Checkout (State logic, Coupon application UI).
- **DAY 11:** Payment Integration (Razorpay frontend, COD flow, Success pages).

### PHASE 3: ADMIN & POLISH (DAYS 12-18)
- **DAY 12:** Admin Panel UI (Dashboard layout, Management screens).
- **DAY 13:** Admin Orders & Inventory (Order details, Status updates, Badge system).
- **DAY 14:** UI Polish & UX (Micro-animations, Loading states, Mobile optimization).
- **DAY 15:** Full System Testing (Payment edge cases, Coupon validation).
- **DAY 16:** Performance & SEO (Lazy loading, Meta tags, Image optimization).
- **DAY 17:** Deployment (Cloud hosting, SSL, ENV verification).
- **DAY 18:** Buffer Day (Client feedback, Minor tweaks).

---

## ✨ ANIMATION & UX RULES
1. **Load First, Animate Second:** Never let animations block data visualization.
2. **User Control:** Animations must not block user clicks or navigation.
3. **Mobile First:** Keep mobile animations lightweight (transform/opacity only).
4. **Consistency:** Use Framer Motion variants across all similar components.
5. **Impact:** Reserve GSAP only for high-conversion areas (Hero sections).

---
*Developed for Rich Club by Antigravity AI.*
