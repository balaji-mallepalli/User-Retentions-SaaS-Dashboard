import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthCore'
import { AiOutlineDashboard, AiOutlineLineChart, AiOutlineTeam, AiOutlineAppstore, AiOutlineCode, AiOutlineMenu } from 'react-icons/ai'
import { BiLogOut, BiUser } from 'react-icons/bi'
import Overview from './pages/Overview'
import Retention from './pages/Retention'
import Cohorts from './pages/Cohorts'
import FeatureUsage from './pages/FeatureUsage'
import Login from './pages/Login'
import Register from './pages/Register'
import JsonServerDemo from './pages/JsonServerDemo'

const Nav = () => {
  const { user, logout } = useAuth() || {}
  const location = useLocation()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Overview', icon: <AiOutlineDashboard size={18} /> },
    { path: '/retention', label: 'Retention', icon: <AiOutlineLineChart size={18} /> },
    { path: '/cohorts', label: 'Cohorts', icon: <AiOutlineTeam size={18} /> },
    { path: '/feature-usage', label: 'Feature Usage', icon: <AiOutlineAppstore size={18} /> },
    { path: '/json-demo', label: 'JSON Demo', icon: <AiOutlineCode size={18} /> },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="brand-icon">📊</span>
            <span className="brand-text">Analytics Hub</span>
          </Link>
        </div>
        
        <div className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <AiOutlineMenu size={24} />
        </div>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links-wrapper">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-user">
            {user ? (
              <div className="user-info">
                <div className="user-avatar">
                  <BiUser size={16} />
                </div>
                <div className="user-details">
                  <span className="user-greeting">Hi, {user.name || user.email}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button 
                  className="btn-logout" 
                  onClick={() => { logout(); window.location.pathname = '/' }}
                  title="Sign out"
                >
                  <BiLogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-signin">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="page">
        <div className="container">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/retention" element={<Retention />} />
          <Route path="/cohorts" element={<Cohorts />} />
          <Route path="/feature-usage" element={<FeatureUsage />} />
          <Route path="/json-demo" element={<JsonServerDemo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
