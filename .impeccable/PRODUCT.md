# HAVEN — Product Overview & Design Context

## 1. Product Identity & Purpose
**HAVEN** is a curated, high-trust real estate portal for premium residential and commercial properties across major Indian metropolitan hubs (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Goa).

The core brand promise is: **"Built for living, not just listing."**
HAVEN differentiates itself from noisy, high-friction legacy portals (MagicBricks, 99acres, NoBroker) by prioritizing:
- **Verified Listings**: Curated catalog with verified owners and direct representatives.
- **Calm, High-Signal Discovery**: Zero aggressive broker popups, zero intrusive call spam, no bait-and-switch listings.
- **Architectural & Spatial Clarity**: Highlighting architectural integrity, verified square footage, exact carpet area, and clear pricing without hidden caveats.

---

## 2. Target User Personas & Core Journeys

### A. The Discerning Homebuyer / Renter
- **Profile**: Urban professionals, founders, and families seeking design-forward apartments, villas, and penthouses.
- **Key Pain Point**: Sifting through thousands of duplicate, fake, or outdated broker listings on mass-market platforms.
- **Primary Journey**: Browse curated catalog -> Filter by city/budget/property type -> Inspect rich property media & specifications -> Direct, verified inquiry to the owner/representative -> Save favorites across sessions.

### B. The Property Owner / Developer
- **Profile**: Direct property owners and boutique developers in premium locales.
- **Key Pain Point**: Getting overwhelmed by low-intent broker cold calls and unqualified leads.
- **Primary Journey**: List property through the platform -> Receive verified, structured lead inquiries with contact data and intent messages -> Monitor listing status (Available, Sold, Rented).

### C. The Platform Administrator
- **Profile**: HAVEN curation and operations team.
- **Key Pain Point**: Maintaining high catalog standards and preventing duplicate, fraudulent, or unverified listings.
- **Primary Journey**: Access administrative portal (`/admin`) -> Review catalog metrics -> Create/Update listings with high-res photography -> Triage customer leads & inquiries CRM.

---

## 3. Product Surface Area & Routes

| Route | View | Description | Key Interactivity |
|---|---|---|---|
| `/` | `HomePage` | Brand entrance, hero discovery, handpicked featured properties, category exploration, value proposition, testimonials | Purpose toggle, quick search bar, city destination cards, featured grid |
| `/properties` | `PropertiesPage` | Main marketplace catalog with multi-dimensional filtering | Keyword search, City, Property Type, Purpose, Min/Max Price, Sort controls, mobile drawer |
| `/properties/:id` | `PropertyDetailsPage` | Comprehensive property monograph | High-res gallery, architectural specs, verified amenities, direct contact modal, share link, similar listings |
| `/favorites` | `FavoritesPage` | Curated collection of user-saved properties | Dynamic sync with MongoDB user profile, quick removal/navigation |
| `/admin` | `AdminDashboard` | Dual-tab operational command center | Catalog management (CRUD + image upload + status toggling), Inquiries CRM (lead triage & status tracking) |
| `/login` | `LoginPage` | Authentication portal | Form validation (Zod + React Hook Form), role-based redirect |
| `/register` | `RegisterPage` | Account registration | Password strength, profile setup, role assignment |
| `*` | `NotFoundPage` | Calm 404 fallback | Navigation recovery to Home or Catalog |
