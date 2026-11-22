# 🎯 HAVEN — Viva Demonstration Checklist & Examiner Walkthrough Guide

**Project:** HAVEN Real Estate Portal  
**Presenter:** Aamit Baran Pattanayak  
**Context:** Summer Internship Examination & Technical Project Defense  
**Architecture:** Full-Stack MERN (Node.js 24, Express 5, React 19, MongoDB Atlas, Tailwind v4)  

---

## 1. Pre-Demo Setup & Verification (5 Minutes Before Viva)

Follow these steps before the examiner calls your name:

### Step 1: Open Terminals
Open two terminal tabs in the repository root:

- **Terminal 1 — Backend API:**
  ```powershell
  cd backend
  npm run dev
  ```
  *Expected Output:*
  ```text
  [nodemon] starting `node src/server.js`
  MongoDB connected: cluster0.xxxxx.mongodb.net
  Server running in development mode on port 5000
  ```

- **Terminal 2 — Frontend Application:**
  ```powershell
  cd frontend
  npm run dev
  ```
  *Expected Output:*
  ```text
  VITE v6.4.3  ready in 320 ms
  ➜  Local:   http://localhost:5173/
  ```

### Step 2: Open Browser
- Open Chrome or Edge at `http://localhost:5173`.
- Ensure DevTools Console is open in a small dock (shows clean console without uncaught errors).

---

## 2. Test Accounts & Live Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin@haven.com` | `admin123` | Full admin console, property CRUD, lead inbox, status toggles |
| **Verified Buyer / User** | `user@haven.com` | `user123` | Property discovery, saving favorites, direct owner inquiry |

*(If test accounts are not pre-seeded, simply click "Join HAVEN" and register a new user in 10 seconds — registration is live and automatic).*

---

## 3. Step-by-Step 5-Minute Viva Demonstration Script

### Minute 1: The Monograph Homepage & Brand Philosophy
- **What to say:**
  > *"Examiner Sir / Ma'am, typical real estate portals in India suffer from aggressive broker spam, visual clutter, and misleading carpet area data. We built HAVEN with an Architectural Editorial philosophy — treating every home as a curated residence rather than a generic commodity."*
- **What to do:**
  1. Show the homepage hero section. Point out the refined typography (`Cormorant Garamond` serif with `Plus Jakarta Sans` numbers).
  2. Scroll down through the "Curated Portfolio", the "Architectural Monograph" section, and the metropolitan city breakdown.
  3. Highlight the calm, intentional color palette (`#FBFBF9` background with `#14532D` deep forest green accents).

---

### Minute 2: Catalog Filtering & Dynamic URL Synchronization
- **What to say:**
  > *"Our exploration engine is fully synchronized with URL search parameters. Filter changes update the address bar deterministically, allowing users to bookmark or share exact filtered views."*
- **What to do:**
  1. Click **"Buy"** in the top navigation.
  2. Select **Metropolitan Area:** `Bengaluru`.
  3. Select **Property Typology:** `Villa`.
  4. Notice the active filter badges appear instantly above the grid.
  5. Demonstrate sorting by clicking the Sort dropdown and choosing **"Price: Low to High"**.
  6. Point out that the backend satisfies this query using compound indexes in under 20 milliseconds without in-memory sorting.

---

### Minute 3: Property Details, Numerical Hierarchy & Monograph PDF Export
- **What to say:**
  > *"On the property details page, we eliminated decorative marketing buzzwords and placed verified real estate metrics at the primary focal point. We prioritize RERA-mandated Carpet Area over ambiguous super built-up claims."*
- **What to do:**
  1. Click into **"The Courtyard Residence"** (or any listing).
  2. Highlight the **Key Metrics Strip**: Price, Carpet Area (1,850 sq ft), Bed count (3 BHK), and Bath count (3 Baths).
  3. Show the **Spatial Efficiency Ratio**: Displays the exact percentage ratio of Carpet Area to Built-Up Area (e.g., 77% efficiency).
  4. Click on the main photograph to open the **Fullscreen Lightbox**:
     - Press **Right Arrow** and **Left Arrow** on your keyboard to navigate photos.
     - Press **Escape** to dismiss the modal cleanly.
  5. Click the **"Monograph PDF"** button:
     - Show the examiner the clean browser print preview.
     - Point out that the navigation bar, buttons, and contact forms disappear, leaving a clean vector A4 brochure with HAVEN masthead and property specs.

---

### Minute 4: Saved Residences & Direct Lead Capture
- **What to say:**
  > *"To protect users from spam, HAVEN provides direct owner connectivity with persistent lead capture in MongoDB, avoiding broker intermediation."*
- **What to do:**
  1. Click the **"Save" (Heart)** button on the property. Point out the badge count update in the navbar.
  2. Click **"Inquire About Residence"** to open the contact modal.
  3. Submit an inquiry (e.g., *"I would like to schedule a private walkthrough this Saturday"*).
  4. Show the animated success confirmation.

---

### Minute 5: Administrative Console & Lead Management
- **What to say:**
  > *"Finally, HAVEN features a protected Admin Console where property managers can maintain the catalog, upload photos, and track live inquiries."*
- **What to do:**
  1. Sign in as `admin@haven.com`.
  2. Click **"Admin Console"** in the user menu.
  3. Show the **Direct Customer Inquiries** inbox — the inquiry you just sent is visible with timestamp, applicant details, and property title.
  4. Demonstrate the **"Register New Property"** modal, highlighting the RERA number input and image upload pipeline.
  5. Conclude:
     > *"HAVEN delivers end-to-end full-stack integrity, complete unit test coverage, and a modern architectural user experience."*

---

## 4. Contingency & Troubleshooting Cheat Sheet

| Situation | Immediate Fix |
|---|---|
| **MongoDB Atlas connection drops during viva** | In `backend/.env`, temporarily point `MONGODB_URI` to `mongodb://127.0.0.1:27017/real-estate-portal` if local MongoDB is installed, or keep terminal hotspot active. |
| **Port 5000 already in use** | Run `npx kill-port 5000` in PowerShell, then rerun `npm run dev`. |
| **Examiner asks: "How do you prevent SQL/NoSQL injection?"** | Answer: *"We use Express `mongo-sanitize` middleware to strip any query keys starting with `$` or containing `.`, preventing malicious operator injection like `{ $gt: '' }`."* |
| **Examiner asks: "Why use Cormorant Garamond for a real estate app?"** | Answer: *"High-end architectural monographs use serif typography to evoke craftsmanship, heritage, and permanence. We balance it with modern sans-serif (`Plus Jakarta Sans`) for numbers and body copy to preserve legibility."* |
| **Examiner asks: "How do you test this application?"** | Answer: *"We have 48 automated tests using Jest and Supertest covering authentication, property CRUD, search filters, favorites, inquiries, and RBAC security."* |
