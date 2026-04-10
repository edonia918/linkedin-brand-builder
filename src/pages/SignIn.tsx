import { useState, type FormEvent } from 'react'
import './SignIn.css'

type Tab = 'signin' | 'signup'

export function SignIn() {
  const [tab, setTab] = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // signin fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // signup fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function passwordStrength(pw: string): { label: string; cls: string } {
    let s = 0
    if (pw.length >= 8) s++
    if (/[a-z]/.test(pw)) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    if (s < 3) return { label: 'Weak — add uppercase, numbers, or symbols', cls: 'weak' }
    if (s < 4) return { label: 'Medium — one more element for stronger security', cls: 'medium' }
    return { label: 'Strong password!', cls: 'strong' }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Sign in failed')

      sessionStorage.setItem('launchbrandCurrentUser', JSON.stringify(data.user))
      sessionStorage.setItem('launchbrandToken', data.token)
      window.location.href = '/workspace.html'
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields.'); return
    }
    if (!/\S+@\S+\.\S+/.test(signupEmail)) { setError('Please enter a valid email.'); return }
    if (signupPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (signupPassword !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email: signupEmail, password: signupPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Account creation failed')

      sessionStorage.setItem('launchbrandCurrentUser', JSON.stringify(data.user))
      sessionStorage.setItem('launchbrandToken', data.token)
      window.location.href = '/workspace.html'
    } catch (err: any) {
      setError(err.message || 'Account creation failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = signupPassword ? passwordStrength(signupPassword) : null

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account or create a new one</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError('') }}
          >Sign In</button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >Create Account</button>
        </div>

        {loading ? (
          <div className="auth-loading">
            <div className="auth-spinner" />
            <p>Processing...</p>
          </div>
        ) : tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="form-group">
              <label htmlFor="signinEmail">Email Address</label>
              <input
                id="signinEmail"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signinPassword">Password</label>
              <input
                id="signinPassword"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg">Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  placeholder="John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  placeholder="Doe"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupEmail">Email Address</label>
              <input
                id="signupEmail"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input
                id="signupPassword"
                type="password"
                className="form-control"
                placeholder="Create a strong password"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
              />
              {strength && (
                <div className={`password-strength ${strength.cls}`}>{strength.label}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg">Create Account</button>
          </form>
        )}
      </div>
    </div>
  )
}
