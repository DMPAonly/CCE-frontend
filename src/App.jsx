import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./Components/auth/SignupPage.jsx";
import VerifyEmailPage from "./Components/auth/VerifyEmailPage.jsx";
import LoginPage from "./Components/auth/LoginPage.jsx";
import ForgotPasswordPage from "./Components/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./Components/auth/ResetPasswordPage.jsx";
import Dashboard from "./Components/Dashboard.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import Workspace from "./Components/shared/Workspace.jsx";
import FileViewer from "./Components/shared/FileViewer.jsx";
import EditorPage from "./Pages/EditorPage.jsx";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster 
                  position="top-right" 
                  toastOptions={{
                      style: {
                          background: '#1e1e2e',
                          color: '#fff',
                          border: '1px solid #334155',
                      },
                  }}
              />
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes — require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/file/:id"
        element={
          <ProtectedRoute>
            <FileViewer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:roomId/:fileId"
        element={
            <ProtectedRoute>
                <EditorPage />
            </ProtectedRoute>
        }
    />

      {/* Default redirect — unauthenticated users go to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}
