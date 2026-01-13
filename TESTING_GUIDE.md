# 🧪 Rich Club - Automated Testing Guide

## Overview

This guide covers the complete automated test suite for the Rich Club eCommerce platform, including:
- **Jest** (Backend API & Business Logic)
- **Playwright** (End-to-End UI Testing)

---

## 📋 Prerequisites

### 1. Environment Setup
Ensure both servers are running:

```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Server
cd client
npm run dev
```

**Expected URLs:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### 2. Database State
- MongoDB should be running and accessible
- Test data will be created/cleaned automatically
- **Note**: Tests use the same database as development (be cautious with production data)

---

## 🔧 Part A: Jest Backend Tests

### Installation (Already Done)
```bash
cd server
npm install --save-dev jest supertest cross-env
```

### Test Files Location
```
server/tests/
├── auth.test.js          # Admin authorization & role checks
├── product.test.js       # Product validation (stock, images)
├── coupon.test.js        # Coupon logic & rate limiting
└── order.test.js         # Order security & payment integrity
```

### Running Tests

#### Run All Backend Tests
```bash
cd server
npx jest --maxWorkers=1
```

#### Run Individual Test Suites
```bash
# Auth & Authorization Tests
npx jest tests/auth.test.js

# Product Validation Tests
npx jest tests/product.test.js

# Coupon Logic Tests
npx jest tests/coupon.test.js

# Order Integrity Tests
npx jest tests/order.test.js
```

#### Run with Verbose Output
```bash
npx jest --verbose --maxWorkers=1
```

#### Run with Coverage Report
```bash
npx jest --coverage --maxWorkers=1
```

### Expected Results

✅ **auth.test.js** (3 tests)
- ✓ Blocks access without token (401)
- ✓ Blocks non-admin user (403)
- ✓ Allows admin access (200)

✅ **product.test.js** (2 tests)
- ✓ Rejects negative stock (400)
- ✓ Rejects more than 8 images (400)

✅ **coupon.test.js** (3 tests)
- ✓ Rejects expired coupon (400)
- ✓ Rejects coupon below min purchase (400)
- ✓ Blocks coupon brute force (429)

✅ **order.test.js** (1 test)
- ✓ Does NOT place order with manual payment status (400)

**Total: 9 tests**

### Troubleshooting Jest Tests

#### Issue: "User not found" (401 errors)
**Cause**: Tests create temporary users in `beforeAll` hooks.
**Solution**: Tests are designed to be self-contained. If you see this error, ensure MongoDB is running.

#### Issue: Rate limit tests failing
**Cause**: Rate limit memory store persists across test runs.
**Solution**: Run tests with `--maxWorkers=1` (sequential execution) or wait 1 minute between runs.

#### Issue: Validation errors during setup
**Cause**: Mongoose schema validation on test data.
**Solution**: Tests use `{ validateBeforeSave: false }` for intentionally invalid data (e.g., expired coupons).

---

## 🎭 Part B: Playwright End-to-End Tests

### Installation

```bash
cd client
npm install -D @playwright/test
npx playwright install chromium
```

**Note**: Browser download is ~150MB and may take several minutes.

### Test Files Location
```
client/tests/
└── e2e.spec.js           # Critical user flows (PDP, Cart, Checkout)
```

### Running Playwright Tests

#### Run All E2E Tests
```bash
cd client
npx playwright test tests/e2e.spec.js
```

#### Run with UI Mode (Interactive)
```bash
npx playwright test tests/e2e.spec.js --ui
```

#### Run in Headed Mode (See Browser)
```bash
npx playwright test tests/e2e.spec.js --headed
```

#### Run Specific Test
```bash
npx playwright test tests/e2e.spec.js -g "PDP"
```

#### Generate HTML Report
```bash
npx playwright test tests/e2e.spec.js --reporter=html
npx playwright show-report
```

### Expected Results

✅ **e2e.spec.js** (3 tests)
- ✓ PDP: Buy section stays visible on scroll
- ✓ Shop: Add to Cart button visible without hover
- ✓ Checkout: Mobile responsive padding (≥16px)

**Total: 3 tests**

### Troubleshooting Playwright Tests

#### Issue: "Executable doesn't exist"
**Cause**: Chromium browser not installed.
**Solution**:
```bash
npx playwright install chromium
```

#### Issue: "Target closed" or "Navigation timeout"
**Cause**: Frontend server not running or wrong URL.
**Solution**: 
1. Verify `npm run dev` is running in `client` directory
2. Check `http://localhost:5173` is accessible
3. Update `BASE_URL` in `e2e.spec.js` if using different port

#### Issue: Tests fail on "No products found"
**Cause**: Empty database or products not loaded.
**Solution**: 
1. Ensure backend is running
2. Add at least one product via Admin panel
3. Or seed the database with test data

#### Issue: Selector not found
**Cause**: CSS class names changed or elements not rendered.
**Solution**: 
1. Inspect the page manually
2. Update selectors in `e2e.spec.js` to match current DOM structure

---

## 🎯 Test Coverage Summary

### Security Tests ✅
- [x] JWT authentication (no token = 401)
- [x] Role-based authorization (non-admin = 403)
- [x] Payment status spoofing prevention
- [x] Rate limiting on critical routes

### Data Validation Tests ✅
- [x] Negative stock rejection
- [x] Max image limit (8 images)
- [x] Expired coupon rejection
- [x] Minimum purchase amount enforcement

### Business Logic Tests ✅
- [x] Coupon validation with subtotal
- [x] Order creation security
- [x] Rate limit enforcement (429 after threshold)

### UI/UX Tests ✅
- [x] PDP sticky buy box (desktop)
- [x] Add to Cart button visibility
- [x] Mobile responsive padding

---

## 📊 Running Full Test Suite

### Complete Test Run (Recommended)

```bash
# 1. Backend Tests
cd server
npx jest --maxWorkers=1 --verbose

# 2. Frontend Tests (ensure servers are running)
cd ../client
npx playwright test tests/e2e.spec.js --reporter=list
```

### CI/CD Integration

Add to `package.json` scripts:

**server/package.json**:
```json
{
  "scripts": {
    "test": "jest --maxWorkers=1",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --maxWorkers=1"
  }
}
```

**client/package.json**:
```json
{
  "scripts": {
    "test:e2e": "playwright test tests/e2e.spec.js",
    "test:e2e:ui": "playwright test tests/e2e.spec.js --ui",
    "test:e2e:headed": "playwright test tests/e2e.spec.js --headed"
  }
}
```

---

## 🔍 Test Maintenance

### Adding New Tests

#### Backend (Jest)
1. Create new file in `server/tests/`
2. Follow existing pattern:
   ```javascript
   const request = require('supertest');
   const app = require('../server');
   
   describe('Feature Name', () => {
     it('should do something', async () => {
       const res = await request(app).get('/api/endpoint');
       expect(res.status).toBe(200);
     });
   });
   ```

#### Frontend (Playwright)
1. Add test to `client/tests/e2e.spec.js`
2. Follow existing pattern:
   ```javascript
   test('Feature description', async ({ page }) => {
     await page.goto(`${BASE_URL}/path`);
     await expect(page.locator('.selector')).toBeVisible();
   });
   ```

### Updating Selectors
If UI changes break Playwright tests, update selectors in `e2e.spec.js`:
- Use data-testid attributes for stability
- Prefer semantic selectors over CSS classes
- Use `page.locator()` with flexible matchers

---

## 🚨 Known Issues & Limitations

### Jest Tests
1. **Database Pollution**: Tests use real database. Consider using `mongodb-memory-server` for isolation.
2. **Rate Limit Flakiness**: Sequential execution (`--maxWorkers=1`) required to avoid false failures.
3. **Cleanup**: User accounts created in tests are cleaned up in `afterAll`, but may persist if tests are interrupted.

### Playwright Tests
1. **Browser Download**: First-time setup requires ~150MB download.
2. **Server Dependency**: Tests require both frontend and backend servers running.
3. **Admin Flow**: Admin product creation test requires pre-existing admin user (not auto-created).

---

## 📈 Next Steps

### Recommended Improvements
1. **Test Database**: Use separate test database or in-memory MongoDB
2. **Test Data Seeding**: Create seed scripts for consistent test data
3. **Visual Regression**: Add Playwright screenshot comparison tests
4. **API Contract Tests**: Add schema validation for API responses
5. **Performance Tests**: Add load testing with Artillery or k6

### Monitoring in Production
1. Set up error tracking (Sentry)
2. Add uptime monitoring (UptimeRobot)
3. Implement logging (Winston + CloudWatch)
4. Add performance monitoring (New Relic)

---

## 📞 Support

If tests fail unexpectedly:
1. Check server logs for errors
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Review test output for specific error messages
5. Check this guide's troubleshooting sections

---

**Last Updated**: January 12, 2026
**Test Suite Version**: 1.0.0
**Minimum Node Version**: 18.x
