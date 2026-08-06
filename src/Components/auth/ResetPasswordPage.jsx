import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import PasswordInput from '../shared/PasswordInput';
import { isPasswordValid } from '../../utils/passwordValidation';

/**
 * Extracts a human-readable error string from an Axios error response.
 *
 * Backend returns either:
 *   { success:false, message:"Validation failed", data:{ fieldName:"reason" } }
 * or:
 *   { success:false, message:"descriptive message" }
 *
 * We merge field-level messages so the user knows exactly what went wrong.
 */
function extractErrorMessage(err) {
  if (!err.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const body = err.response.data;
  if (!body) {
    return `Request failed (${err.response.status}). Please try again.`;
  }

  // If there are field-level validation errors, surface them all
  if (body.data && typeof body.data === 'object' && Object.keys(body.data).length > 0) {
    return Object.values(body.data).join(' ');
  }

  return body.message || `Request failed (${err.response.status}). Please try again.`;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Token is passed as ?token=<uuid> in the reset link email
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side guards
    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }
    if (!isPasswordValid(form.newPassword)) {
      setError('Your password does not meet the requirements listed below.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter both fields.');
      return;
    }

    setLoading(true);

    try {
      // POST /api/v1/auth/reset-password  { token, newPassword }
      await resetPassword({ token, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Invalid / missing token ──────────────────────────────────────────────
  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>{'</>'}</span>
            <span style={styles.logoText}>CollabCode</span>
          </div>
          <div style={styles.iconWrap}>⚠️</div>
          <h1 style={styles.heading}>Invalid Reset Link</h1>
          <p style={styles.subheading}>
            This password reset link is invalid or has already been used.
            Please request a new one.
          </p>
          <Link to="/forgot-password" id="request-new-link" style={styles.btnLink}>
            Request a new reset link
          </Link>
          <p style={styles.footer}>
            <Link to="/login" style={styles.link}>← Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Branding */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>

        <div style={styles.iconWrap}>🔒</div>
        <h1 style={styles.heading}>Set a new password</h1>
        <p style={styles.subheading}>
          {success
            ? 'Password updated! Redirecting you to login…'
            : "Choose a strong password you haven't used before."}
        </p>

        {/* Error */}
        {error && (
          <div id="reset-error" style={styles.errorBox}>
            {error}
          </div>
        )}

        {success ? (
          <div style={styles.successCard}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>✅</div>
            <p style={styles.successText}>
              Password reset successful!<br />
              Redirecting you to login…
            </p>
          </div>
        ) : (
          <form id="reset-form" onSubmit={handleSubmit} style={styles.form} noValidate>
            {/* New Password with live checklist */}
            <PasswordInput
              id="reset-password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min 8 chars • A–Z • a–z • 0–9 • @$!%*?&"
              autoComplete="new-password"
              showChecklist={true}
              label="New Password"
            />

            {/* Confirm Password */}
            <PasswordInput
              id="reset-confirm"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              showChecklist={false}
              label="Confirm Password"
            />

            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
            >
              {loading ? 'Updating password…' : 'Update Password'}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '24px', color: '#818cf8', fontWeight: 700, fontFamily: 'monospace' },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  iconWrap: { fontSize: '36px', marginBottom: '12px' },
  heading: { fontSize: '24px', fontWeight: 700, margin: '0 0 8px' },
  subheading: { fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 },
  errorBox: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#fca5a5',
    marginBottom: '16px',
    textAlign: 'left',
    lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' },
  btn: {
    marginTop: '20px',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s',
    width: '100%',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  btnLink: {
    display: 'inline-block',
    marginTop: '16px',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
  successCard: { textAlign: 'center', padding: '12px 0 8px' },
  successText: { fontSize: '15px', color: '#86efac', lineHeight: 1.7, margin: 0 },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '24px' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
