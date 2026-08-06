import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import PasswordInput from '../shared/PasswordInput';
import { isPasswordValid } from '../../utils/passwordValidation';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(form.password)) {
      setError('Password does not meet the requirements listed below.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate('/verify-email', { state: { email: form.email }, replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.data && Object.values(err.response.data.data).join(', ')) ||
        'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / branding */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>

        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subheading}>Join thousands of developers collaborating in real time.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label} htmlFor="signup-fullName">Full Name</label>
          <input
            id="signup-fullName"
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Ada Lovelace"
            value={form.fullName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />

          <label style={styles.label} htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            style={styles.input}
            type="email"
            name="email"
            placeholder="ada@collabcode.io"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <PasswordInput
            id="signup-password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 chars, upper, lower, digit, symbol"
            autoComplete="new-password"
            showChecklist={true}
            label="Password"
          />

          <PasswordInput
            id="signup-confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            showChecklist={false}
            label="Confirm Password"
          />

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Log in</Link>
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
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    color: '#f1f5f9',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: '24px',
    color: '#818cf8',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 6px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 28px',
    textAlign: 'center',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#fca5a5',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: '#94a3b8', marginTop: '10px' },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    marginTop: '22px',
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
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '22px' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
