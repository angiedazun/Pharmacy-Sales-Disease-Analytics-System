# 🏥 MediTrend Analytics
### Sri Lanka Pharmacy Sales & Disease Analytics System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  A full-stack health analytics platform for monitoring pharmacy sales and disease outbreaks across all 25 districts of Sri Lanka — with role-based access control, real-time dashboards, and interactive district-level visualizations.
</p>

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards — Total Sales, Revenue, Active Pharmacies, Disease Cases
- Animated gauge-style pie chart for top medicines
- Bar charts for monthly sales trends
- District-level filtering *(Admin & Analyst only)*
- Pharmacy-scoped view — pharmacy users see **only their own data**

### 💊 Sales Management
- Record new sales with medicine, quantity, price, disease link & district
- Full sales history with search, date-range filter, and **CSV export**
- Pharmacy/District columns auto-hidden for pharmacy role users

### 🦠 Disease Analytics *(Admin & Analyst only)*
- Disease case tracking by district and medicine
- Medicine trend analysis — top sellers over configurable time windows
- Sri Lanka interactive district map with intensity heatmap
- Outbreak alert system with priority severity levels

### 👥 User & Access Management
- **Three roles**: Admin · Analyst · Pharmacy
- Admin panel: full CRUD for users, pharmacies, medicines, and diseases
- JWT-based authentication with bcrypt-hashed passwords
- Audit logs for all system events

### 📤 Export & Reports
- CSV export for filtered sales data
- District and date-range report scoping

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Recharts, React Router v6 |
| **Backend** | Node.js, Express 4.18, JWT Auth, bcryptjs |
| **Database** | MongoDB 7 + Mongoose ODM |
| **Icons** | React Icons (Material Design) |
| **Dev Tools** | Nodemon, dotenv |

---

## 🗂 Project Structure

```
Pharmacy-Sales-Disease-Analytics-System/
│
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers (auth, sales, analytics …)
│   ├── middleware/auth.js      # JWT verification & role guard
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── seeders/seed.js         # Demo data seeder (25 districts)
│   └── server.js               # Entry point — port 5000
│
├── frontend/
│   └── src/
│       ├── components/         # Layout, Navbar, Sidebar
│       ├── context/            # AuthContext (JWT + user state)
│       ├── pages/              # Dashboard, Analytics, Sales, Admin …
│       └── services/api.js     # Axios instance with JWT interceptor
│
├── .env.example                # Required environment variables template
├── start-backend.bat           # Windows one-click backend start
├── start-frontend.bat          # Windows one-click frontend start
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`
- Git

### 1 — Clone the Repository

```bash
git clone https://github.com/angiedazun/Pharmacy-Sales-Disease-Analytics-System.git
cd Pharmacy-Sales-Disease-Analytics-System
```

### 2 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/meditrend
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start the server:

```bash
node server.js
# API running at http://localhost:5000
```

### 3 — Seed Demo Data

```bash
node seeders/seed.js
```

Creates sample pharmacies, medicines, diseases, users, and sales for all 25 Sri Lankan districts.

### 4 — Frontend Setup

```bash
cd ../frontend
npm install
node ./node_modules/vite/bin/vite.js
# App running at http://localhost:5173
```

> **Windows shortcut:** double-click `start-backend.bat` and `start-frontend.bat`

---

## 🔐 Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | admin@pharmasys.lk | Admin@2026 | Full system access |
| **Analyst** | analyst@pharmasys.lk | Analyst@2026 | Analytics + Sales (read) |
| **Pharmacy** | colombo@pharmasys.lk | Pharmacy@2026 | Own pharmacy data only |
| **Pharmacy** | kandy@pharmasys.lk | Pharmacy@2026 | Own pharmacy data only |
| **Pharmacy** | gampaha@pharmasys.lk | Pharmacy@2026 | Own pharmacy data only |

> All 25 district pharmacies follow: **`{district}@pharmasys.lk`** / `Pharmacy@2026`

---

## 🔒 Role-Based Access Matrix

| Feature | Admin | Analyst | Pharmacy |
|---------|:-----:|:-------:|:--------:|
| Dashboard — all districts | ✅ | ✅ | ❌ |
| Dashboard — own pharmacy | ✅ | ✅ | ✅ |
| Sales Entry | ✅ | ❌ | ✅ |
| Sales History — all | ✅ | ✅ | ❌ |
| Sales History — own | ✅ | ✅ | ✅ |
| CSV Export | ✅ | ✅ | ✅ |
| Disease Analytics | ✅ | ✅ | ❌ |
| Medicine Trend | ✅ | ✅ | ❌ |
| Outbreak Alerts | ✅ | ✅ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |

---

## 🌍 Sri Lanka District Coverage

All **25 districts** covered:

> Colombo · Gampaha · Kalutara · Kandy · Matale · Nuwara Eliya · Galle · Matara · Hambantota · Jaffna · Mannar · Vavuniya · Mullaitivu · Kilinochchi · Batticaloa · Ampara · Trincomalee · Kurunegala · Puttalam · Anuradhapura · Polonnaruwa · Badulla · Moneragala · Ratnapura · Kegalle

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate user, returns JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sales` | List sales (role-scoped) |
| `POST` | `/api/sales` | Record a new sale |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard` | KPI stats |
| `GET` | `/api/analytics/disease-summary` | Disease breakdown by district |
| `GET` | `/api/analytics/medicine-trend` | Medicine sales over time |
| `GET` | `/api/analytics/alerts` | Active outbreak alerts |

### Admin (Admin role only)
| Endpoints |
|-----------|
| `GET/POST/PUT/DELETE` — `/api/users` |
| `GET/POST/PUT/DELETE` — `/api/pharmacies` |
| `GET/POST/PUT/DELETE` — `/api/medicines` |
| `GET/POST/PUT/DELETE` — `/api/diseases` |

---

## ⚠️ Disclaimer

> Medicine sales data provides **trend estimation only**, not clinical diagnosis.
> This system is for health monitoring and analytics purposes only.

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**angiedazun** · [GitHub Profile](https://github.com/angiedazun)

---

<p align="center">🇱🇰 Built for Sri Lanka's Healthcare System · MediTrend Analytics 2026</p>

### Step 1 — Start Backend
```bash
cd backend
npm install
node seeders/seed.js    # Seeds database with Sri Lanka data
npm run dev             # Starts API on http://localhost:5000
```

### Step 2 — Start Frontend
```bash
cd frontend
npm install
npm run dev             # Opens http://localhost:5173
```

Or use the `.bat` files (double-click):
- `start-backend.bat`
- `start-frontend.bat`

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@pharmasys.lk | Admin@2026 |
| **Pharmacy** | colombo@pharmasys.lk | Pharmacy@2026 |
| **Analyst** | analyst@pharmasys.lk | Analyst@2026 |

---

## 🏗️ Architecture

```
PharmaSys/
├── backend/                    # Node.js + Express API
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # MongoDB Schemas
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── Disease.js
│   │   ├── Pharmacy.js
│   │   └── Sale.js
│   ├── controllers/            # Business logic
│   ├── routes/                 # REST API endpoints
│   ├── middleware/auth.js      # JWT authentication
│   ├── seeders/seed.js         # Database seeder
│   └── server.js
│
└── frontend/                   # React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Login.jsx        # Auth screen
        │   ├── Dashboard.jsx    # Main analytics dashboard
        │   ├── SalesEntry.jsx   # Record new sale
        │   ├── SalesHistory.jsx # View all sales
        │   ├── Analytics.jsx    # Disease analytics
        │   └── admin/           # Admin management pages
        ├── components/          # Sidebar, Navbar, Layout
        ├── context/             # Auth context
        └── services/api.js      # Axios API service
```

---

## 📊 Features

### Dashboard
- Total Sales, Revenue, Active Pharmacies stats
- Monthly Sales Trend (Area Chart)
- Top 10 Medicines Distribution (Pie Chart)
- Top Medicines Ranked by Quantity (Bar Chart)
- Medicine → Disease Mapping Table
- District filter

### Disease Analytics
- Most Common Diseases (estimated from medicine sales)
- Disease Frequency Radar Chart
- Disease Rankings with severity progress bars
- District Heatmap (sales intensity by district)
- Disease disclaimer banner

### Sales Management
- Record medicine sales (pharmacy role)
- Filter sales by district, date range
- Paginated sales history
- Prescription tracking

### Admin Panel
- Manage Medicines with disease mapping
- Manage Diseases (ICD codes, severity, symptoms)
- Manage Pharmacies (all 25 Sri Lanka districts)
- Manage Users (Admin, Pharmacy, Analyst roles)

---

## 🗄️ Database: `pharmacy_analytics_db`

Collections:
- `users` — System users with roles
- `medicines` — Medicine catalog with disease links
- `diseases` — Disease registry
- `pharmacies` — 25 pharmacies (one per district)
- `sales` — Sales transactions with analytics indexes

---

## 🔌 API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/analytics/dashboard
GET    /api/analytics/diseases
GET    /api/analytics/district-heatmap
GET    /api/analytics/medicine-trend/:id
GET    /api/analytics/disease-district

GET/POST/PUT/DELETE  /api/sales
GET/POST/PUT/DELETE  /api/medicines
GET/POST/PUT/DELETE  /api/diseases
GET/POST/PUT/DELETE  /api/pharmacies
GET/POST/PUT/DELETE  /api/users
```

---

## ⚠️ Important Notice

> Medicine sales data provides **trend estimation only**, not medical diagnosis.
> Some medicines treat multiple diseases. Self-medication affects accuracy.
> This system is for health monitoring and analytics purposes only.

---

*Built with Node.js · Express · MongoDB · React · Tailwind CSS · Recharts*
