import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthCore'
import { AiOutlineMail, AiOutlineLock } from 'react-icons/ai'

const Login = () => {
  const [email, setEmail] = useState('admin@local.test')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-content">
            <h1>User Retention</h1>
            <p>Analytics Dashboard</p>
            <div className="brand-features">
              <div className="feature">✓ Track user behavior</div>
              <div className="feature">✓ Analyze retention metrics</div>
              <div className="feature">✓ Make data-driven decisions</div>
            </div>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="form-container">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to your account to continue</p>

            {error && (
              <div className="error-box">
                <span>⚠ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <AiOutlineMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <AiOutlineLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="link">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
