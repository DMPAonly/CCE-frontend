import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './shared/ProfileModal';

/**
 * Dashboard — the main landing page after login.
 *
 * Features:
 *  - Header with CollabCode branding + avatar button
 *  - Create Collaborative Room card
 *  - Join Collaborative Room card
 *  - ProfileModal (triggered by avatar click)
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  function getInitials(name) {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');
  }

  function handleWorkspace() {
    navigate(`/workspace`);
  }

  function handleJoinRoom(e) {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (!id) {
      setJoinError('Please enter a room ID.');
      return;
    }
    navigate(`/editor/${id}`);
  }

  return (
    <div style={styles.page}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.greeting}>Hey, {user?.name?.split(' ')[0] || 'there'} 👋</span>
          {/* Avatar — opens ProfileModal */}
          <button
            id="dashboard-avatar"
            style={styles.avatarBtn}
            onClick={() => setShowProfile(true)}
            aria-label="Open profile"
            title="Profile"
          >
            {getInitials(user?.name)}
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Code together,{' '}
          <span style={styles.heroAccent}>in real time.</span>
        </h1>
        <p style={styles.heroSub}>
          Create a collaborative room or join an existing one to start coding with your team.
        </p>
      </section>

      {/* ── Cards ──────────────────────────────────────────── */}
      <main style={styles.cards}>
        {/* Create Room */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>💼</div>
          <h2 style={styles.cardTitle}>Workspace</h2>
          <p style={styles.cardDesc}>
            Create new files in your workspace or edit existing ones.
          </p>
          <button
            id="dashboard-create-room"
            style={styles.btnPrimary}
            onClick={handleWorkspace}
          >
            Go to Workspace
          </button>
        </div>

        {/* Join Room */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>🔗</div>
          <h2 style={styles.cardTitle}>Join a Room</h2>
          <p style={styles.cardDesc}>
            Have a room ID? Enter it below to jump into an existing collaborative session.
          </p>
          <form onSubmit={handleJoinRoom} style={styles.joinForm} noValidate>
            <input
              id="dashboard-room-id"
              style={styles.joinInput}
              type="text"
              placeholder="Enter room ID…"
              value={roomIdInput}
              onChange={(e) => { setRoomIdInput(e.target.value); setJoinError(''); }}
              autoComplete="off"
              maxLength={40}
            />
            {joinError && <p style={styles.joinError}>{joinError}</p>}
            <button
              id="dashboard-join-room"
              type="submit"
              style={styles.btnSecondary}
            >
              Join Room
            </button>
          </form>
        </div>
      </main>

      {/* ── Profile Modal ──────────────────────────────────── */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Inter', sans-serif",
    color: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
  },

  /* Header */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '22px', color: '#818cf8', fontWeight: 700, fontFamily: 'monospace' },
  logoText: {
    fontSize: '18px',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  greeting: { fontSize: '14px', color: '#94a3b8' },
  avatarBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  /* Hero */
  hero: {
    textAlign: 'center',
    padding: '80px 24px 40px',
  },
  heroTitle: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 800,
    margin: '0 0 16px',
    lineHeight: 1.2,
  },
  heroAccent: {
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '16px',
    color: '#94a3b8',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: 1.7,
  },

  /* Cards */
  cards: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '40px 24px 80px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '340px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardIcon: { fontSize: '40px' },
  cardTitle: { fontSize: '20px', fontWeight: 700, margin: 0 },
  cardDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 },

  /* Buttons */
  btnPrimary: {
    marginTop: '8px',
    padding: '13px 28px',
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
  btnSecondary: {
    padding: '12px 28px',
    borderRadius: '10px',
    border: '1px solid rgba(99,102,241,0.5)',
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%',
  },

  /* Join form */
  joinForm: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' },
  joinInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
    boxSizing: 'border-box',
  },
  joinError: {
    fontSize: '12px',
    color: '#fca5a5',
    margin: 0,
    textAlign: 'left',
  },
};
