import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../shared/PasswordInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If user was redirected from a protected route, send them back there after login
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>{"</>"}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to continue coding.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
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
            id="login-password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            autoComplete="current-password"
            showChecklist={false}
            label="Password"
          />

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={
              loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn
            }
          >
            {loading ? "Signing in…" : "Log In"}
          </button>
        </form>

        <p style={styles.footer}>
          New here?{" "}
          <Link to="/signup" style={styles.link}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    padding: "24px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    color: "#f1f5f9",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: "24px",
    color: "#818cf8",
    fontWeight: 700,
    fontFamily: "monospace",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 700,
    background: "linear-gradient(90deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heading: {
    fontSize: "24px",
    fontWeight: 700,
    margin: "0 0 6px",
    textAlign: "center",
  },
  subheading: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 28px",
    textAlign: "center",
  },
  errorBox: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.4)",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "13px",
    color: "#fca5a5",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#94a3b8", marginTop: "10px" },
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#f1f5f9",
    outline: "none",
    transition: "border-color 0.2s",
  },
  forgotRow: { textAlign: "right", marginTop: "4px" },
  btn: {
    marginTop: "20px",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
    marginTop: "22px",
  },
  link: { color: "#818cf8", textDecoration: "none", fontWeight: 600 },
};
