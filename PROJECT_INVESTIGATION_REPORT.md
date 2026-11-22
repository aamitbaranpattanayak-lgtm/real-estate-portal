# 🔍 HAVEN Real Estate Portal — Complete Engineering Audit & Investigation Report

**Project Name:** HAVEN — Real Estate Portal  
**Author:** Aamit Baran Pattanayak (Diploma in Computer Science & Engineering)  
**Date of Audit:** November 2026  
**Auditor:** Senior Full-Stack Software Engineer, QA & Security Reviewer  
**Audit Scope:** Full codebase inspection (Frontend, Backend, Database, Auth, Security, UI/UX, QA, Deployment)  
**Independent Reviewers:** Goldfish Elephant-Goldfish Model (EGM) — Pragmatic Tech Lead & Hostile Design Critic  

---

## 1. Existing Architecture

The application is architected as a decoupled client-server web platform using the **MERN** stack:

- **Frontend Client:** React 19 single-page application bundled with Vite. Client-side routing is handled via `react-router-dom` v7 with lazy route chunking wrapped in React `Suspense`. Global authentication and favorites states are managed via React Context (`AuthContext` and `FavoriteContext`). API communication occurs through a central Axios instance with request/response interceptors.
- **Backend Service:** Express.js REST API running on Node.js (v24 compatible). The API architecture follows standard layered controller-route-model separation with central error handling middleware (`errorMiddleware.js`) and JWT bearer token authorization (`authMiddleware.js`, `adminMiddleware.js`).
- **Database Layer:** MongoDB with Mongoose ODM (v9.x). Collections are structured around `User` and `Property` models with schema validation, compound indexes for querying, and virtual/populate relationships.
- **Static Assets & Media:** Images currently leverage remote CDN URLs (Unsplash) with fallbacks. Backend dependencies declare `multer` and `cloudinary`, but no media upload service is wired.

---

## 2. Technology Stack & Package Audit

| Component | Specified in Project | Installed Version | Evaluation |
|---|---|---|---|
| **Runtime** | Node.js | v24.18.0 | High performance modern JavaScript runtime. |
| **Backend Framework** | Express | ^5.2.1 | Express 5 with native promise support in route handlers. |
| **ODM / Database** | Mongoose | ^9.9.1 | MongoDB ODM with schema types and query helpers. |
| **Authentication** | JWT & bcryptjs | `jsonwebtoken` ^9.0.3, `bcryptjs` ^3.0.3 | Industry standard stateless auth. |
| **Security & Utilities** | Helmet, CORS, Compression | `helmet` ^8.1.0, `cors` ^2.8.6, `compression` ^1.8.1 | Good foundational middleware. |
| **Frontend Framework** | React | ^19.0.0 | Latest React release with native hooks. |
| **Build Tool** | Vite | ^6.0.11 | High speed ESM development and rollup bundler. |
| **Styling** | Tailwind CSS | ^4.0.0 (`@tailwindcss/vite`) | Tailwind v4 with `@import "tailwindcss";`. |
| **UI Icons & Animation**| Lucide & Framer Motion | `lucide-react` ^0.474.0, `framer-motion` ^11.18.0 | Clean icon pack and fluid animations. |
| **Form Validation** | React Hook Form & Zod | `react-hook-form` ^7.54.2, `zod` ^3.24.1 | Robust schema-driven form validation on client. |

---

## 3. Existing Features & Implementation Status

| Feature | Frontend Status | Backend Status | Persistence & Verification |
|---|---|---|---|
| **User Registration** | ✅ Form with Zod validation | ✅ `POST /api/auth/register` | Verified; hashes passwords with bcrypt (10 rounds). |
| **User Login** | ✅ Form with Zod validation | ✅ `POST /api/auth/login` | Verified; issues signed JWT (7 days). |
| **Current User Profile** | ⚠️ In dropdown only | ✅ `GET /api/auth/me` | Verified; lacks dedicated profile page / edit options. |
| **Browse Properties** | ✅ Grid layout with cards | ✅ `GET /api/properties` | Verified; fetches real MongoDB records. |
| **Filter by Purpose/City/Type/Price** | ✅ Multi-parameter filter | ✅ Query filters + indexes | Verified; handles combined query filters. |
| **Keyword / Text Search** | ❌ Missing on public page | ❌ Not implemented in API | Only in-memory filter on admin table. |
| **Property Details Page** | ✅ Detailed breakdown | ✅ `GET /api/properties/:id` | Populates owner details and similar properties. |
| **Saved / Favorites** | ✅ Heart toggle + Saved page | ✅ `GET/POST/DELETE /api/favorites` | Saved in `User.favorites` array with atomic operators. |
| **Contact / Enquiry Form** | ⚠️ Form present in modal | ⚠️ Only GET contact info; `submit` is fake timeout | **Critical gap**: Messages are not persisted to database. |
| **Admin Dashboard** | ✅ Metric cards + Property Table | ✅ Protected by role check | Lists, creates, updates, and deletes properties. |
| **Property Image Upload** | ❌ Raw URL input only | ❌ Multer unused | Dependencies exist but no upload endpoint exists. |
| **Automated Tests** | ❌ No test files | ❌ No test files | Zero automated unit or integration tests exist. |

---

## 4. Backend Issues & Vulnerabilities

1. **[CRITICAL] Missing Contact/Enquiry Persistence:**
   The `ContactOwnerModal` allows users to draft inquiries to property owners, but the form submission is an artificial 2-second client-side `setTimeout` (`handleSendMessage`). There is no `Inquiry` model, no inquiry controller, and no API endpoint to receive, validate, or store inquiries.
2. **[CRITICAL] Unused Image Upload Infrastructure & Cloud Risk:**
   `package.json` installs `multer`, `cloudinary`, and `multer-storage-cloudinary`, yet no route, middleware, or controller exists. If uploads are simply written to local disk on ephemeral hosting (Render/Heroku), redeployments destroy images.
3. **[HIGH] Missing Keyword Search & ReDoS Risks:**
   `GET /api/properties` only supports exact `city`, `purpose`, and `propertyType` matching plus `minPrice`/`maxPrice` bounding. If keyword search is added via unsanitized regex, it opens ReDoS attack vectors.
4. **[HIGH] Lack of Server-side Input Validation on Property Mutation:**
   `createProperty` and `updateProperty` accept `req.body` directly without server-side validation schemas (e.g. valid price range, valid purpose, valid property type, non-negative numbers).
5. **[HIGH] Null-Crash on Deleted Favorites:**
   If a property in `user.favorites` was deleted from the database, `populate("favorites")` produces a `null` entry. In `FavoriteContext.jsx`, `item._id` throws `TypeError: Cannot read properties of null`, crashing the entire frontend.
6. **[MEDIUM] Inconsistent CORS Configuration with Frontend Port:**
   `frontend/vite.config.js` configures the dev server on port `3000`, while `backend/src/app.js` only hardcodes `http://localhost:5173`. Direct requests without the Vite proxy fail with CORS errors if accessed on `localhost:3000`.
7. **[MEDIUM] Empty Middleware File:**
   `backend/src/middleware/notFoundMiddleware.js` is 0 bytes (empty), while `notFound` is actually exported from `errorMiddleware.js`.
8. **[MEDIUM] Generic Duplicate Key Error Message:**
   In `errorMiddleware.js`, `err.code === 11000` is hardcoded to return `"User already exists"`, even if another model or field triggers a duplicate key conflict.

---

## 5. Frontend Issues

1. **[HIGH] Contact Modal Schema Contract Mismatch:**
   `ContactOwnerModal.jsx` only possessed a single textarea without fields for sender name, sender email, or sender phone number, preventing guest lead collection.
2. **[HIGH] Inconsistent Design System & Color Tokens:**
   `NotFoundPage.jsx` and `AppRoutes.jsx`'s fallback spinner use Tailwind `slate-*` and `emerald-*` classes, whereas `HomePage.jsx`, `PropertiesPage.jsx`, and `Navbar.jsx` use warm `#FAFAF8`, `stone-*`, and `#14532D`.
3. **[HIGH] Hardcoded Secondary Images and Amenities:**
   On `PropertyDetailsPage.jsx`, the side gallery displays identical hardcoded Unsplash photos (`photo-1600585154340-be6161a56a0c` and `photo-1600607687939-ce8a6c25118c`) for all properties. The 8 amenities are also hardcoded static strings.
4. **[HIGH] Missing Free-Text Search Input on Catalog Page:**
   `PropertiesPage.jsx` contains dropdown filters and a price range, but has no search bar to search properties by title, keyword, or address.
5. **[MEDIUM] Lack of Live Image Preview in Admin Modal:**
   When adding or editing a property in `AdminDashboard.jsx`, there is no real-time thumbnail preview or image upload control, increasing the risk of broken images.
6. **[MEDIUM] Property Status Lack of Visual Indicators:**
   Properties with status `"sold"` or `"rented"` are displayed identically to `"available"` properties without badge or visual distinction.

---

## 6. Independent Goldfish Review Findings & Required Safeguards

Two independent fresh-context Goldfish reviewers audited this report:
1. **Design Critic (`egm-design`)**
2. **Implementation Readiness Lead (`egm-implementation-readiness`)**

### Critical Safeguards Mandated by Reviewers:
1. **Upload Subsystem Architecture:**
   - Must be protected with `protect` and `admin` middleware.
   - Storage should support Cloudinary if `CLOUDINARY_*` keys exist, with local disk storage in `backend/uploads/` as a zero-config fallback.
   - Filenames MUST use cryptographically randomized UUIDs (`crypto.randomUUID()`) with an extension allowlist (`.jpg`, `.jpeg`, `.png`, `.webp`). Never use raw client filenames.
   - Vite proxy must proxy `/uploads` to `http://localhost:5000` (or Express mounts `/api/uploads`) to prevent 404 image errors in development.
2. **Inquiry Subsystem & Modal Alignment:**
   - Schema: `property` (ObjectId, ref Property), `name` (String, required), `email` (String, required), `phone` (String, required), `message` (String, required), `status` (enum: pending, contacted, closed).
   - In `deleteProperty`, add cascading deletion: `await Inquiry.deleteMany({ property: property._id })`.
   - In `ContactOwnerModal.jsx`, pass `propertyId` and render inputs for Name, Email, and Phone (prefilled from `user` if authenticated).
   - Sanitize inquiry text server-side to prevent Stored XSS in Admin Dashboard.
3. **Search & ReDoS Safeguard:**
   - Escape regex characters: `keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`.
4. **Favorites Null Defense:**
   - In `favoriteController.js`, filter out nulls: `user.favorites.filter(Boolean)`.
   - In `FavoriteContext.jsx`, defensively filter out null items before mapping `_id`.
5. **Test Suite Lifecycle:**
   - Provide standard `beforeAll` and `afterAll` Mongoose hooks to prevent test suite hangs and isolate test database operations.
6. **Backward Compatibility:**
   - Keep `GET /api/properties` returning a flat array in `res.data` for unpaginated calls.
   - Keep `GET /api/properties/:id/contact` intact for reading owner metadata.

---

## 7. Hardened Remediation Implementation Plan

### Phase A: Backend Repairs & Hardening
1. **Inquiry Subsystem:**
   - `backend/src/models/Inquiry.js` (Schema with validation & indexes)
   - `backend/src/controllers/inquiryController.js` (Submit inquiry, get all inquiries, delete inquiry)
   - `backend/src/routes/inquiryRoutes.js` (Mounted at `/api/inquiries`)
   - Add inquiry cascading cleanup in `propertyController.deleteProperty`
2. **Upload Subsystem:**
   - `backend/src/middleware/uploadMiddleware.js` (Multer with UUID filename, mime validation, 5MB limit)
   - `backend/src/routes/uploadRoutes.js` (Mounted at `/api/upload`, protected by `protect, admin`)
   - Serve static uploads via Express at `/uploads` and `/api/uploads`
   - Update `frontend/vite.config.js` to proxy `/uploads`
3. **Property Controller & Search Hardening:**
   - Add keyword search (`search` / `keyword` query param) with regex escaping on `title`, `city`, `address`
   - Sanitize query parameters to prevent NoSQL query object injection
   - Add payload validation for `createProperty` and `updateProperty`
4. **Favorites & Middleware Polish:**
   - Add `.filter(Boolean)` in `getFavorites`
   - Update `errorMiddleware.js` to dynamically parse `err.keyValue` on code 11000
   - Remove unused empty `notFoundMiddleware.js`
   - Include port 3000 in CORS `allowedOrigins`

### Phase B: Frontend Design Transformation & Impeccable Polish
1. **Design System & Visual Alignment:**
   - Unify all colors: `#FAFAF8` background, `#14532D` deep forest green, `#22C55E` accent, warm `stone-*` neutral scale.
   - Refactor `NotFoundPage.jsx`, `AppRoutes.jsx`, and `Footer.jsx` to match this palette.
2. **Contact Modal & Inquiry Integration:**
   - Upgrade `ContactOwnerModal.jsx` to take `propertyId` and render sender fields (`name`, `email`, `phone`, `message`), prefilled for logged-in users.
   - Submit real data via `POST /api/inquiries`.
3. **Catalog & Search:**
   - Add a prominent, responsive search input on `PropertiesPage.jsx` with instant keyword search and clear button.
4. **Admin Dashboard Upgrade:**
   - Add direct file upload button with instant preview alongside URL input.
   - Add an **Inquiries & Leads** tab in `AdminDashboard.jsx` allowing the admin to view all incoming messages, property titles, contact info, and timestamps, with deletion capabilities.
   - Add status badge and toggle ("available", "sold", "rented").
5. **Property Details & Gallery:**
   - Dynamic amenity badges and property status badge.
   - Handle secondary images and gallery preview.
6. **Favorites Null Defense:**
   - Defensive mapping in `FavoriteContext.jsx`.

### Phase C: Automated Testing Suite
1. Setup Jest and Supertest in `backend/package.json`.
2. Write integration tests covering:
   - Auth: Register, Login, Duplicate email rejection, Invalid credentials.
   - Property: Public catalog retrieval, filtering, keyword search, Admin CRUD, Protected route enforcement.
   - Favorites: Add, list, remove, deduplication.
   - Inquiries: Submit inquiry, Admin view, Admin delete.
   - File Upload: Validation checks.
3. Run tests and verify 100% pass rate.
4. Run frontend production build (`npm run build`).

### Phase D: Viva Preparation Guide
1. Produce `PROJECT_VIVA_GUIDE.md` covering all 15 required sections, local setup, test execution, demo script, and architectural justifications.
