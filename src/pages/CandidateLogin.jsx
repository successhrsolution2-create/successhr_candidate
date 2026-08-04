import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Eye, EyeOff, KeyRound, Loader2, Lock, LogIn,
  Phone, Shield, Sparkles, UserPlus, UserRound
} from 'lucide-react'
import axios from 'axios'
import { loginCandidatePortal, fetchCandidateSession, setFromSignup } from '../store/candidateAuthSlice'

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const API_ROOT = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : `http://${defaultHost}:5000`)

/* ─── tiny animated floating particles ─── */
function Particle({ style }) {
  return <span className="ca-particle" style={style} aria-hidden="true" />
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  key: i,
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${5 + Math.random() * 7}s`,
    opacity: 0.12 + Math.random() * 0.22,
  }
}))

/* ══════════════════════════════════════
   LOGIN PANEL
══════════════════════════════════════ */
function LoginPanel({ urlCode }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.candidateAuth)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ identifier: false, password: false })

  const inputRef = useRef(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150) }, [])

  // Smart detection: 10-digit number = mobile, else = candidateCode
  const isMobile = /^\d{10}$/.test(identifier.trim())

  const errors = {}
  if (!identifier.trim()) errors.identifier = 'Mobile number or Candidate ID is required'
  if (!password) errors.password = 'Password is required'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ identifier: true, password: true })
    if (Object.keys(errors).length) return

    const credentials = isMobile
      ? { mobileNumber: identifier.trim(), password }
      : { candidateCode: identifier.trim().toUpperCase(), password }

    const result = await dispatch(loginCandidatePortal(credentials))

    if (loginCandidatePortal.fulfilled.match(result)) {
      const dest = urlCode ? `/apply/${urlCode}` : '/apply'
      navigate(dest, { replace: true })
    }
  }

  return (
    <form id="candidate-login-form" onSubmit={handleSubmit} noValidate className="ca-form">
      {/* Mobile / Candidate ID */}
      <div className="ca-field-wrap">
        <label htmlFor="ca-identifier" className="ca-label">
          <Phone size={14} className="ca-label-icon" />
          Mobile Number or Candidate ID
        </label>
        <div className={`ca-input-wrap ${touched.identifier && errors.identifier ? 'ca-input-error' : ''}`}>
          <input
            ref={inputRef}
            id="ca-identifier"
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="e.g. 9876543210 or SC-1042"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
            className="ca-input"
            aria-describedby="identifier-error"
          />
        </div>
        {identifier.trim().length > 0 && (
          <span className="ca-input-hint">
            {isMobile ? '📱 Logging in with mobile number' : '🪪 Logging in with Candidate ID'}
          </span>
        )}
        {touched.identifier && errors.identifier && (
          <span id="identifier-error" className="ca-field-error" role="alert">{errors.identifier}</span>
        )}
      </div>

      {/* Password */}
      <div className="ca-field-wrap">
        <label htmlFor="ca-login-password" className="ca-label">
          <Lock size={14} className="ca-label-icon" />
          Password
        </label>
        <div className={`ca-input-wrap ca-input-password ${touched.password && errors.password ? 'ca-input-error' : ''}`}>
          <input
            id="ca-login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className="ca-input"
            aria-describedby="login-password-error"
          />
          <button type="button" id="toggle-login-password" className="ca-eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {touched.password && errors.password && (
          <span id="login-password-error" className="ca-field-error" role="alert">{errors.password}</span>
        )}
      </div>

      {error && (
        <div className="ca-api-error" role="alert">
          <span className="ca-api-error-dot" />
          {error}
        </div>
      )}

      <button type="submit" id="candidate-login-submit" disabled={loading} className="ca-submit-btn">
        {loading ? <><Loader2 size={18} className="ca-spinner" />Signing in…</> : <><LogIn size={18} />Login to Portal</>}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════
   REGISTER PANEL
══════════════════════════════════════ */
function SignUpPanel({ urlCode, onSuccess, onGoToLogin }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    candidateName: '',
    mobileNumber: '',
    emailId: '',
    candidatePassword: '',
    candidatePasswordConfirm: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(null) // { candidateCode }

  const nameRef = useRef(null)
  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 150) }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }))

  // Validation
  const errors = {}
  if (!form.candidateName.trim()) errors.candidateName = 'Full name is required'
  if (!form.mobileNumber.trim() || !/^\d{10}$/.test(form.mobileNumber.trim()))
    errors.mobileNumber = 'Enter a valid 10-digit mobile number'
  if (!form.candidatePassword) errors.candidatePassword = 'Password is required'
  else if (form.candidatePassword.length < 6) errors.candidatePassword = 'Minimum 6 characters'
  if (!form.candidatePasswordConfirm) errors.candidatePasswordConfirm = 'Please confirm your password'
  else if (form.candidatePassword !== form.candidatePasswordConfirm) errors.candidatePasswordConfirm = 'Passwords do not match'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ candidateName: true, mobileNumber: true, emailId: true, candidatePassword: true, candidatePasswordConfirm: true })
    setApiError('')
    if (Object.keys(errors).length) return

    setLoading(true)
    try {
      const endpoint = urlCode
        ? `${API_ROOT}/api/public/apply/${urlCode}`
        : `${API_ROOT}/api/public/apply`

      const body = new FormData()
      body.append('candidateName', form.candidateName.trim())
      body.append('mobileNumber', form.mobileNumber.trim())
      if (form.emailId.trim()) body.append('emailId', form.emailId.trim())
      body.append('candidatePassword', form.candidatePassword)
      body.append('candidatePasswordConfirm', form.candidatePasswordConfirm)

      const { data } = await axios.post(endpoint, body, { withCredentials: true })

      const candidateInfo = {
        id: data.cmsCandidateId || data.studentId,
        candidateCode: data.candidateCode,
        fullName: form.candidateName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        candidateToken: data.candidateToken // Auto-login token
      }
      localStorage.setItem('candidate_portal_user', JSON.stringify(candidateInfo))

      setSuccess({ candidateCode: data.candidateCode })
      onSuccess(candidateInfo)

      // Auto-redirect to form after showing success animation
      setTimeout(() => {
        const dest = urlCode ? `/apply/${urlCode}` : '/apply'
        navigate(dest, { replace: true })
      }, 2500)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="ca-signup-success" role="status">
        {/* Animated rings */}
        <div className="ca-success-rings" aria-hidden="true">
          <div className="ca-success-ring ca-success-ring-1" />
          <div className="ca-success-ring ca-success-ring-2" />
          <div className="ca-success-ring ca-success-ring-3" />
          <div className="ca-success-check">✓</div>
        </div>

        <h3 className="ca-signup-success-title">🎉 Thank You for Registering!</h3>
        <p className="ca-signup-success-sub">Welcome to Success HR Solutions. Your account is ready.</p>

        {/* Candidate ID badge */}
        <div className="ca-success-id-card">
          <span className="ca-success-id-label">Your Candidate ID</span>
          <span className="ca-signup-code ca-signup-code-lg">{success.candidateCode}</span>
          <span className="ca-success-id-note">📋 Save this ID — you'll use it to log in next time</span>
        </div>

        <div className="ca-signup-success-loader" style={{ marginTop: '16px' }}>
          <Loader2 size={16} className="ca-spinner" /> Redirecting to your form…
        </div>
      </div>
    )
  }

  return (
    <form id="candidate-signup-form" onSubmit={handleSubmit} noValidate className="ca-form">
      {/* Full Name */}
      <div className="ca-field-wrap">
        <label htmlFor="su-name" className="ca-label">
          <UserRound size={14} className="ca-label-icon" />
          Full Name <span className="ca-required">*</span>
        </label>
        <div className={`ca-input-wrap ${touched.candidateName && errors.candidateName ? 'ca-input-error' : ''}`}>
          <input ref={nameRef} id="su-name" type="text" placeholder="Enter your full name"
            value={form.candidateName} onChange={set('candidateName')} onBlur={blur('candidateName')}
            className="ca-input" autoComplete="name" />
        </div>
        {touched.candidateName && errors.candidateName && (
          <span className="ca-field-error" role="alert">{errors.candidateName}</span>
        )}
      </div>

      {/* Mobile */}
      <div className="ca-field-wrap">
        <label htmlFor="su-mobile" className="ca-label">
          <Phone size={14} className="ca-label-icon" />
          Mobile Number <span className="ca-required">*</span>
        </label>
        <div className={`ca-input-wrap ${touched.mobileNumber && errors.mobileNumber ? 'ca-input-error' : ''}`}>
          <input id="su-mobile" type="tel" inputMode="numeric" maxLength={10}
            placeholder="10-digit mobile number"
            value={form.mobileNumber}
            onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value.replace(/\D/g, '') }))}
            onBlur={blur('mobileNumber')} className="ca-input" autoComplete="tel" />
        </div>
        {touched.mobileNumber && errors.mobileNumber && (
          <span className="ca-field-error" role="alert">{errors.mobileNumber}</span>
        )}
      </div>

      {/* Email (optional) */}
      <div className="ca-field-wrap">
        <label htmlFor="su-email" className="ca-label">
          <span style={{ fontSize: 14 }}>@</span>
          Email <span className="ca-optional">(optional)</span>
        </label>
        <div className="ca-input-wrap">
          <input id="su-email" type="email" placeholder="your@email.com"
            value={form.emailId} onChange={set('emailId')} onBlur={blur('emailId')}
            className="ca-input" autoComplete="email" />
        </div>
      </div>

      {/* Password */}
      <div className="ca-field-wrap">
        <label htmlFor="su-password" className="ca-label">
          <Lock size={14} className="ca-label-icon" />
          Create Password <span className="ca-required">*</span>
        </label>
        <div className={`ca-input-wrap ca-input-password ${touched.candidatePassword && errors.candidatePassword ? 'ca-input-error' : ''}`}>
          <input id="su-password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
            value={form.candidatePassword} onChange={set('candidatePassword')} onBlur={blur('candidatePassword')}
            className="ca-input" autoComplete="new-password" />
          <button type="button" id="toggle-signup-password" className="ca-eye-btn"
            onClick={() => setShowPwd((v) => !v)} tabIndex={-1}
            aria-label={showPwd ? 'Hide password' : 'Show password'}>
            {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {touched.candidatePassword && errors.candidatePassword && (
          <span className="ca-field-error" role="alert">{errors.candidatePassword}</span>
        )}
      </div>

      {/* Confirm Password */}
      <div className="ca-field-wrap">
        <label htmlFor="su-confirm-password" className="ca-label">
          <Lock size={14} className="ca-label-icon" />
          Confirm Password <span className="ca-required">*</span>
        </label>
        <div className={`ca-input-wrap ca-input-password ${touched.candidatePasswordConfirm && errors.candidatePasswordConfirm ? 'ca-input-error' : ''}`}>
          <input id="su-confirm-password" type={showPwd2 ? 'text' : 'password'} placeholder="Re-enter your password"
            value={form.candidatePasswordConfirm} onChange={set('candidatePasswordConfirm')} onBlur={blur('candidatePasswordConfirm')}
            className="ca-input" autoComplete="new-password" />
          <button type="button" id="toggle-signup-confirm-password" className="ca-eye-btn"
            onClick={() => setShowPwd2((v) => !v)} tabIndex={-1}
            aria-label={showPwd2 ? 'Hide password' : 'Show password'}>
            {showPwd2 ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {touched.candidatePasswordConfirm && errors.candidatePasswordConfirm && (
          <span className="ca-field-error" role="alert">{errors.candidatePasswordConfirm}</span>
        )}
      </div>

      {apiError && (
        <div className="ca-api-error" role="alert">
          <span className="ca-api-error-dot" />
          {apiError}
        </div>
      )}

      <button type="submit" id="candidate-signup-submit" disabled={loading} className="ca-submit-btn ca-submit-btn-signup">
        {loading ? <><Loader2 size={18} className="ca-spinner" />Creating account…</> : <><UserPlus size={18} />Create My Account</>}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function CandidateLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { code: urlCode } = useParams()

  const { authenticated, checking } = useSelector((s) => s.candidateAuth)
  const [tab, setTab] = useState('login') // 'login' | 'signup'

  /* If already logged in, redirect to apply form */
  useEffect(() => {
    if (authenticated && !checking) {
      const dest = urlCode ? `/apply/${urlCode}` : '/apply'
      navigate(dest, { replace: true })
    }
  }, [authenticated, checking, navigate, urlCode])

  /* Re-validate session on mount */
  useEffect(() => {
    dispatch(fetchCandidateSession())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignupSuccess = (candidateInfo) => {
    dispatch(setFromSignup(candidateInfo))
  }

  if (checking) {
    return (
      <div className="ca-login-root ca-checking">
        <div className="ca-checking-inner">
          <Loader2 className="ca-checking-spinner" aria-hidden="true" />
          <p>Verifying session…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ca-login-root">
      {/* animated background */}
      <div className="ca-bg-orb ca-bg-orb-1" aria-hidden="true" />
      <div className="ca-bg-orb ca-bg-orb-2" aria-hidden="true" />
      <div className="ca-bg-orb ca-bg-orb-3" aria-hidden="true" />
      <div className="ca-particles-layer" aria-hidden="true">
        {PARTICLES.map((p) => <Particle key={p.key} style={p.style} />)}
      </div>

      <main className="ca-card-wrap">
        {/* ── Left hero panel ── */}
        <aside className="ca-hero" aria-hidden="true">
          <div className="ca-hero-inner">
            <div className="ca-logo-wrap">
              <img src="/success-logo.jpg" alt="Success HR Solutions" className="ca-logo" />
            </div>

            <div className="ca-hero-tagline">
              <span className="ca-pill">
                <Sparkles size={13} />
                Candidate Portal
              </span>
              <h1 className="ca-hero-title">Your Career<br />Journey Starts<br />Here</h1>
              <p className="ca-hero-sub">
                {tab === 'login'
                  ? 'Log in with your Candidate ID and password to access your application form.'
                  : 'Create your account to start your job application with Success HR Solutions.'}
              </p>
            </div>

            <div className="ca-feature-list">
              {[
                { icon: Shield, text: 'Secure & encrypted portal' },
                { icon: UserRound, text: 'Personalised application form' },
                { icon: KeyRound, text: 'Session-protected access' },
              ].map(({ icon: Icon, text }) => (
                <div className="ca-feature-item" key={text}>
                  <span className="ca-feature-icon"><Icon size={15} /></span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="ca-hero-mission">
              Your Success is Our Mission
            </div>
          </div>
        </aside>

        {/* ── Right panel ── */}
        <section className="ca-form-panel">
          {/* ── Tab switcher ── */}
          <div className="ca-tabs" role="tablist" aria-label="Login or Register">
            <button
              role="tab"
              id="tab-login"
              aria-selected={tab === 'login'}
              aria-controls="tabpanel-login"
              className={`ca-tab ${tab === 'login' ? 'ca-tab-active' : ''}`}
              onClick={() => setTab('login')}
            >
              <LogIn size={15} />
              Login
            </button>
            <button
              role="tab"
              id="tab-signup"
              aria-selected={tab === 'signup'}
              aria-controls="tabpanel-signup"
              className={`ca-tab ${tab === 'signup' ? 'ca-tab-active' : ''}`}
              onClick={() => setTab('signup')}
            >
              <UserPlus size={15} />
              Register
            </button>
          </div>

          {/* ── Form header ── */}
          <div className="ca-form-header">
            <div className={`ca-form-icon-wrap ${tab === 'signup' ? 'ca-form-icon-signup' : ''}`}>
              {tab === 'login' ? <LogIn size={22} className="ca-form-icon" /> : <UserPlus size={22} className="ca-form-icon" />}
            </div>
            <div>
              <h2 className="ca-form-title">
                {tab === 'login' ? 'Login' : 'Register'}
              </h2>
              <p className="ca-form-subtitle">
                {tab === 'login' ? 'Enter your credentials to continue' : 'Register to begin your application'}
              </p>
            </div>
          </div>

          {/* ── Tab panels ── */}
          <div
            id="tabpanel-login"
            role="tabpanel"
            aria-labelledby="tab-login"
            hidden={tab !== 'login'}
          >
            {tab === 'login' && <LoginPanel urlCode={urlCode} />}
          </div>

          <div
            id="tabpanel-signup"
            role="tabpanel"
            aria-labelledby="tab-signup"
            hidden={tab !== 'signup'}
          >
            {tab === 'signup' && <SignUpPanel urlCode={urlCode} onSuccess={handleSignupSuccess} onGoToLogin={() => setTab('login')} />}
          </div>

          <p className="ca-help-text">
            {tab === 'login'
              ? <>Need your Candidate ID or password? Contact the <span className="ca-help-highlight">Success HR Solutions</span> team.</>
              : <>Already registered? <button type="button" className="ca-help-link" onClick={() => setTab('login')}>Login here</button></>
            }
          </p>
        </section>
      </main>
    </div>
  )
}
