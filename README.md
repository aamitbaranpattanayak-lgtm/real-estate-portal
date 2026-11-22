# 🏡 HAVEN

> **Built for living, not just listing.**

HAVEN is a full-stack MERN Real Estate Portal designed to help users discover, explore, and manage properties across India. The platform provides a modern, responsive interface for property buyers while offering administrators a complete dashboard to manage listings.

---

# Live Demo

## 🔑 Demo Credentials

### Admin Account

**Email:** `admin123@gmail.com`  
**Password:** `12345678`

> Use the admin account to access the Admin Dashboard, create properties, edit listings, and manage existing properties.

Frontend:
https://real-estate-portal-alpha-tan.vercel.app

Backend API:
https://real-estate-portal-cb7w.onrender.com

## ✨ Features

### 👤 Authentication
- User Registration & Login
- JWT Authentication
- Persistent Login Sessions
- Role-based Access (User / Admin)

### 🏠 Property Management
- Browse Properties
- View Property Details
- Buy & Rent Listings
- Search & Filter Properties
- Contact Property Owner

### ❤️ Favorites
- Add Properties to Favorites
- Remove Favorites
- Dedicated Favorites Page
- Real-time Favorite Synchronization

### 🛠️ Admin Dashboard
- Secure Admin Access
- Create Property Listings
- Edit Existing Properties
- Delete Properties
- Property Management Dashboard

### 🎨 User Experience
- Responsive Design
- Modern UI inspired by Airbnb & Zillow
- Smooth Animations using Framer Motion
- Premium Typography & Layout
- Mobile Friendly

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Tailwind CSS v4
- Framer Motion
- React Hook Form
- Zod
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

---

# 📁 Project Structure

```
Real Estate Portal/
│
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeds/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── styles/
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/aamitbaranpattanayak-lgtm/real-estate-portal.git
```

Move into the project directory

```bash
cd real-estate-portal
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🌐 Environment Variables

Backend requires:

```env
PORT=
MONGO_URI=
JWT_SECRET=
NODE_ENV=
FRONTEND_URL=
```

## Production notes

- Configure Render's health check to `GET /health`. It does not query MongoDB, so it stays lightweight for uptime monitoring.
- The free Render tier can spin a service down after inactivity. The first request afterwards includes platform startup and MongoDB reconnection time; application-level query optimizations cannot remove that cold-start delay.
- Use the environment template at `backend/.env.example`. Keep `MONGO_MAX_POOL_SIZE` modest (the default is 10) on Render to avoid exhausting an Atlas connection limit.
- Set `MONGO_QUERY_LOGS=true` only while diagnosing database latency. It logs completed MongoDB operations slower than `MONGO_SLOW_QUERY_MS` without logging query values.

---



# 📌 Future Improvements

- Property Image Gallery
- Google Maps Integration
- Property Reviews & Ratings
- Email Notifications
- Recently Viewed Properties
- Property Comparison
- Payment Integration
- Dark Mode

---

# 👨‍💻 Author

**Aamit Baran Pattanayak**

Diploma in Computer Science & Engineering

---

## ⭐ If you found this project useful, consider giving it a star!
