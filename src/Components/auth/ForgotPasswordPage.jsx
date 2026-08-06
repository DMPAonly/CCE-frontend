import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      // Always show success (backend silently ignores unknown emails to prevent enumeration)
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>

        <div style={styles.iconWrap}>🔑</div>
        <h1 style={styles.heading}>Forgot your password?</h1>

        {!sent ? (
          <>
            <p style={styles.subheading}>
              Enter the email associated with your account and we'll send you a reset link.
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
              <label style={styles.label} htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                style={styles.input}
                type="email"
                placeholder="ada@collabcode.io"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                autoComplete="email"
              />
              <button
                id="forgot-submit"
                type="submit"
                disabled={loading}
                style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.successCard}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
            <p style={styles.successText}>
              If an account with <strong style={{ color: '#818cf8' }}>{email}</strong> exists,
              a password reset link has been sent to that address.
            </p>
            <p style={{ ...styles.successText, marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
              Check your spam folder if you don't see it within a few minutes.
            </p>
          </div>
        )}

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

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
    maxWidth: '420px',
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
  heading: { fontSize: '24px', fontWeight: 700, margin: '0 0 12px' },
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
  },
  form: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' },
  label: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
  },
  btn: {
    marginTop: '18px',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  successCard: { textAlign: 'center', padding: '8px 0' },
  successText: { fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '24px' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
