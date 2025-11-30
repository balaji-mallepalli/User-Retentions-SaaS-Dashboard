# User Retention SaaS Analytics Dashboard

A modern, full-stack SaaS analytics platform for tracking user retention metrics, feature usage, and cohort analysis. Built with React, Node.js/Express, and JSON-Server for lightweight data persistence.

## 🎯 Features

- **Modern UI Design**
  - Professional dashboard with gradient effects and animations
  - Responsive design (mobile, tablet, desktop)
  - Dark theme with accent colors
  - Icon-rich navigation

- **Analytics & Metrics**
  - Monthly Active Users (MAU) tracking
  - Daily Active Users (DAU) tracking
  - Stickiness metrics
  - Cohort retention analysis
  - Feature usage reporting
  - DAU trends visualization with Recharts

- **Authentication & Authorization**
  - JWT-based user authentication
  - Secure password hashing with bcrypt
  - Admin registration with code verification
  - Session management

- **User Management**
  - User registration and login
  - Profile management
  - Email-based authentication
  - Session tracking

- **CRUD Operations**
  - JSON Server demo page for interactive CRUD testing
  - Real-time data synchronization
  - RESTful API endpoints

## 🛠 Tech Stack

**Frontend:**
- React 19.2.0 with Vite 7.2.4 (fast development server)
- React Router DOM 7.9.6 (routing)
- Axios 1.13.2 (HTTP client)
- Recharts 3.4.1 (data visualization)
- React Icons 5.5.0 (icon components)
- Tailwind CSS 4.1.17 (utility-first styling)
- Custom CSS with gradients and animations

**Backend:**
- Node.js with Express
- JSON-Server 0.17.3 (lightweight file-based database)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (environment variables)
- CORS enabled for frontend access

**Database:**
- JSON-Server with persistent db.json file-based storage
- No MongoDB required - lightweight and portable

## 📁 Project Structure

```
User-Retentions-SaaS-Dashboard-main/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                 # Main app with navigation
│   │   ├── index.css               # Global styles (1100+ lines)
│   │   ├── main.jsx                # React entry point
│   │   ├── setupApiKey.js          # API key configuration
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance with interceptors
│   │   ├── components/
│   │   │   └── PageHeader.jsx      # Reusable page header
│   │   ├── context/
│   │   │   ├── AuthCore.js         # Auth logic
│   │   │   └── AuthProvider.jsx    # Auth context provider
│   │   └── pages/
│   │       ├── Overview.jsx        # Main dashboard (redesigned)
│   │       ├── Login.jsx           # Login page (modern UI)
│   │       ├── Register.jsx        # Registration page (modern UI)
│   │       ├── Retention.jsx       # Retention analytics
│   │       ├── Cohorts.jsx         # Cohort analysis
│   │       ├── FeatureUsage.jsx    # Feature usage metrics
│   │       └── JsonServerDemo.jsx  # CRUD demo page (redesigned)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js/Express backend
│   ├── server.js                   # Main server file (JSON-based)
│   ├── checkTokenUser.js           # Token validation helper
│   ├── seedDemo.js                 # Demo data seeder
│   ├── package.json
│   ├── .env.example
│   ├── controllers/
│   │   ├── authController.js       # Auth endpoints
│   │   ├── metricsController.js    # Analytics endpoints
│   │   ├── usageController.js      # Usage tracking
│   │   ├── userController.js       # User management
│   │   ├── apiKeyController.js     # API key management
│   │   ├── adminController.js      # Admin endpoints
│   │   └── debugController.js      # Debug utilities
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── apiKeyMiddleware.js     # API key validation
│   │   ├── apiKeyOrAuth.js         # Dual auth (API key or JWT)
│   │   └── adminMiddleware.js      # Admin verification
│   └── routes/
│       ├── authRoutes.js           # Auth endpoints
│       ├── metricsRoutes.js        # Metrics endpoints
│       ├── usageRoutes.js          # Usage endpoints
│       ├── userRoutes.js           # User endpoints
│       ├── apiKeyRoutes.js         # API key routes
│       ├── adminRoutes.js          # Admin routes
│       └── debugRoutes.js          # Debug routes
│
├── json-server/                     # Lightweight JSON database
│   ├── db.json                     # File-based database
│   └── package.json
│
├── README.md                        # This file
└── LICENSE
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies:**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install JSON-Server dependencies
cd ../json-server
npm install
```

2. **Configure environment variables:**

Create `server/.env`:

```env
PORT=5000
JWT_SECRET=your-secure-secret-key-change-this
ADMIN_REGISTRATION_CODE=ADMIN123
CORS_ORIGIN=http://localhost:5173
INGEST_API_KEY=demo-api-key-12345
```

3. **Start all three services (use separate terminal windows):**

```bash
# Terminal 1: Start JSON-Server (port 3001)
cd json-server
npm start

# Terminal 2: Start Backend Server (port 5000)
cd server
npm start

# Terminal 3: Start React Frontend (port 5173)
cd client
npm run dev
```

4. **Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- JSON-Server: http://localhost:3001

### Test Credentials

Use these credentials to login:
- **Email:** admin@local.test
- **Password:** password

Or register a new account on the Register page.

## 📚 Key Pages

| Page | Path | Description |
|------|------|-------------|
| Overview | `/` | Main dashboard with KPI cards and DAU trends |
| Retention | `/retention` | Cohort retention metrics (Day 0/1/7/30) |
| Cohorts | `/cohorts` | Detailed cohort analysis table |
| Feature Usage | `/feature-usage` | Top features by usage frequency |
| JSON Demo | `/json-demo` | Interactive CRUD operations with JSON-Server |
| Login | `/login` | User authentication page |
| Register | `/register` | New user registration |

## 🎨 UI/UX Features

### Modern Design Elements
- **Navbar:** Sticky navigation with icons, active route highlighting, user profile
- **Authentication Pages:** Split-screen layout with brand messaging and form
- **Dashboard:** Professional KPI cards with emoji icons and gradient backgrounds
- **Buttons:** Orange gradient with hover animations (lift effect, shine animation)
- **Forms:** Icon-enhanced inputs with focus states and validation
- **Charts:** Responsive Recharts with smooth animations
- **JSON Demo:** Professional card-based UI with animations

### Color Scheme
- **Primary Accent:** #FF6D00 (McLaren Orange)
- **Background:** #0b0c10 (Space Black)
- **Surface:** #0f1113 (Dark Gray)
- **Text:** #e7e9ea (Light Gray)
- **Muted:** #9aa0a6 (Neutral Gray)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user info

### Metrics
- `GET /api/metrics/dau` - Daily Active Users
- `GET /api/metrics/mau` - Monthly Active Users
- `GET /api/metrics/retention` - Retention metrics

### Usage
- `POST /api/usage/ingest` - Track user events
- `GET /api/usage/events` - Get usage events

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## 🔐 Authentication Flow

1. User registers or logs in
2. Server returns JWT token with 30-day expiration
3. Client stores JWT in `localStorage`
4. Axios interceptor automatically adds token to requests
5. Protected routes require valid JWT
6. 401 responses trigger auto-logout

## 📊 Database Structure (JSON-Server)

```json
{
  "users": [...],
  "sessions": [...],
  "usageEvents": [...],
  "apiKeys": [...],
  "items": [...]
}
```

## 🛠 Development

### Available Scripts

**Client:**
```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
```

**Server:**
```bash
npm start        # Start Express server
```

**JSON-Server:**
```bash
npm start        # Start JSON-Server on port 3001
```

### Hot Module Replacement (HMR)
- CSS changes auto-reload in browser
- Component changes trigger page reload
- No manual refresh needed during development

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process on port or change PORT in .env |
| CORS errors | Ensure CORS_ORIGIN in .env matches frontend URL |
| Login fails | Check credentials (admin@local.test / password) or register new account |
| Buttons not styled | Hard refresh (Ctrl+Shift+R) to clear CSS cache |
| 401 Unauthorized | Check JWT in localStorage, ensure it's not expired |
| JSON-Server EADDRINUSE | Kill existing process: `lsof -i :3001` or `Get-Process | Stop-Process` |

## 📝 Recent Updates

- ✅ Migrated from MongoDB to JSON-Server (no DB setup required)
- ✅ Complete UI redesign with modern professional styling
- ✅ Redesigned navbar with icons and active route highlighting
- ✅ Modern login/register pages with split-screen layout
- ✅ Enhanced dashboard with KPI cards and charts
- ✅ Redesigned JSON Server demo page with CRUD UI
- ✅ Added React Icons throughout the application
- ✅ Responsive design for all devices
- ✅ Improved button styling with gradient and animations

## 🎓 Learning Resources

This project demonstrates:
- Full-stack React + Node.js development
- JWT authentication and session management
- RESTful API design
- Modern CSS (gradients, animations, responsive design)
- Component composition and context API
- Data visualization with Recharts
- Form handling and validation
- Error handling and loading states

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

**Last Updated:** November 30, 2025

For issues or questions, please check the troubleshooting section or open an issue.

