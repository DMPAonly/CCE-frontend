import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deactivateAccount, forgotPassword } from '../../api/authApi';

/**
 * ProfileModal
 *
 * Displays a glassmorphism modal overlay with:
 *  - User avatar (generated from initials)
 *  - Username, Email, Role badge
 *  - Change Password button (triggers forgot-password email flow)
 *  - Delete Account button (calls POST /deactivate, clears auth, redirects to /login)
 *  - Logout button
 *
 * Props:
 *   onClose {function} - called when the modal should close
 */
export default function ProfileModal({ onClose }) {
  const navigate = useNavigate();
  const { user, logout, clearAuth } = useAuth();

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Generate avatar initials from name
  function getInitials(name) {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');
  }

  // Format role for display
  function formatRole(role) {
    if (!role) return 'User';
    return role.replace(/^ROLE_/, '').charAt(0).toUpperCase() +
      role.replace(/^ROLE_/, '').slice(1).toLowerCase();
  }

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleChangePassword = useCallback(async () => {
    if (!user?.email) return;
    setPwLoading(true);
    setPwMessage('');
    setPwError('');
    try {
      await forgotPassword(user.email);
      setPwMessage(`A password reset link has been sent to ${user.email}`);
    } catch (err) {
      setPwError(
        err?.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setPwLoading(false);
    }
  }, [user?.email]);

  const handleDeleteAccount = useCallback(async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deactivateAccount();
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || 'Failed to delete account. Please try again.'
      );
      setDeleteLoading(false);
    }
  }, [deleteConfirm, clearAuth, navigate]);

  const initials = getInitials(user?.name);
  const role = formatRole(user?.role);

  return (
    /* Backdrop */
    <div style={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog">
      {/* Modal card — stop click propagation so clicking inside doesn't close */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button id="profile-close" style={styles.closeBtn} onClick={onClose} aria-label="Close profile">
          ✕
        </button>

        {/* Avatar */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>{initials}</div>
        </div>

        {/* User info */}
        <h2 style={styles.name}>{user?.name || 'Unknown User'}</h2>
        <p style={styles.email}>{user?.email || ''}</p>
        <span style={styles.roleBadge}>{role}</span>

        <div style={styles.divider} />

        {/* Change Password */}
        {pwMessage && <div style={styles.successBox}>{pwMessage}</div>}
        {pwError && <div style={styles.errorBox}>{pwError}</div>}

        <button
          id="profile-change-password"
          style={styles.btnSecondary}
          onClick={handleChangePassword}
          disabled={pwLoading}
        >
          {pwLoading ? 'Sending…' : '🔑 Change Password'}
        </button>

        {/* Delete Account */}
        {deleteError && <div style={styles.errorBox}>{deleteError}</div>}

        {deleteConfirm ? (
          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>
              ⚠️ This will permanently delete your account. Are you sure?
            </p>
            <div style={styles.confirmActions}>
              <button
                id="profile-delete-confirm"
                style={styles.btnDanger}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button
                id="profile-delete-cancel"
                style={styles.btnCancel}
                onClick={() => { setDeleteConfirm(false); setDeleteError(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            id="profile-delete"
            style={styles.btnDangerOutline}
            onClick={handleDeleteAccount}
          >
            🗑️ Delete Account
          </button>
        )}

        <div style={styles.divider} />

        {/* Logout */}
        <button
          id="profile-logout"
          style={styles.btnLogout}
          onClick={handleLogout}
        >
          ↩ Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    padding: '24px',
  },
  modal: {
    background: 'rgba(15,12,41,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '24px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
    color: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '14px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  avatarWrap: {
    marginBottom: '4px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: '#fff',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    letterSpacing: '-1px',
  },
  name: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '4px 0 0',
    textAlign: 'center',
  },
  email: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '2px 0 0',
    textAlign: 'center',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '20px',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '4px',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '6px 0',
  },
  successBox: {
    width: '100%',
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#86efac',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#fca5a5',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  btnSecondary: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(99,102,241,0.4)',
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnDangerOutline: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.08)',
    color: '#fca5a5',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnDanger: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnCancel: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmBox: {
    width: '100%',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '12px',
    padding: '14px',
  },
  confirmText: {
    fontSize: '13px',
    color: '#fca5a5',
    marginBottom: '10px',
    lineHeight: 1.5,
    margin: '0 0 10px',
  },
  confirmActions: {
    display: 'flex',
    gap: '8px',
  },
  btnLogout: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
