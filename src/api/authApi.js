import axios from "axios";

/**
 * Backend base URL.
 * In development: reads VITE_API_BASE_URL from .env (defaults to http://localhost:8080).
 * In production:  set VITE_API_BASE_URL in your CI/CD environment.
 */
const BASE_URL = `${import.meta.env.VITE_API_AUTH_URL ?? "https://authentication-service-937514972080.europe-west1.run.app"}/api/v1/auth`;

const BASE_URL_W = `${import.meta.env.VITE_API_WORK_URL ?? "https://workspace-service-937514972080.asia-south2.run.app"}`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const api2 = axios.create({
  baseURL: BASE_URL_W,
});

// Attach JWT from localStorage on every request that needs authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api2.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.email) {
        config.headers.email = user.email;
      }
    } catch (error) {
      console.error("Failed to read user from localStorage:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Auth API calls ──────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Creates a PendingRegistration (NOT a User). Returns { email, name, role }.
 * Frontend should redirect to /verify-email after this succeeds.
 */
export const register = (data) =>
  api.post("/register", data).then((r) => r.data);

/**
 * POST /api/v1/auth/verify-email
 * Verifies OTP → creates User → deletes PendingRegistration.
 * Body: { email, otp }
 */
export const verifyEmail = (data) =>
  api.post("/verify-email", data).then((r) => r.data);

/**
 * POST /api/v1/auth/resend-verification
 * Resets OTP in PendingRegistration and resends the email.
 * Body: { email }
 */
export const resendVerification = (email) =>
  api.post("/resend-verification", { email }).then((r) => r.data);

/**
 * POST /api/v1/auth/login
 * Returns ApiResponse wrapping { accessToken, refreshToken, tokenType, expiresIn, role, email, name }.
 */
export const login = (data) => api.post("/login", data).then((r) => r.data);

/**
 * POST /api/v1/auth/logout
 * Revokes all refresh tokens for the authenticated user (requires JWT).
 */
export const logout = () => api.post("/logout").then((r) => r.data);

/**
 * POST /api/v1/auth/refresh-token
 * Body: { refreshToken: <token> }
 */
export const refreshToken = (token) =>
  api.post("/refresh-token", { refreshToken: token }).then((r) => r.data);

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Backend generates a UUID token, stores it on the User, and emails a link to
 * {FRONTEND_URL}/reset-password?token=<uuid>
 */
export const forgotPassword = (email) =>
  api.post("/forgot-password", { email }).then((r) => r.data);

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, newPassword }
 * Called by ResetPasswordPage after reading the token from the URL query param.
 */
export const resetPassword = (data) =>
  api.post("/reset-password", data).then((r) => r.data);

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile (requires JWT).
 */
export const getProfile = () => api.get("/me").then((r) => r.data);

/**
 * POST /api/v1/auth/deactivate
 * Soft-deletes the authenticated user's account (requires JWT).
 */
export const deactivateAccount = () =>
  api.post("/deactivate").then((r) => r.data);
