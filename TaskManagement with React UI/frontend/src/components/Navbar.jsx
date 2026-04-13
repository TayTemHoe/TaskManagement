import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Navbar — top navigation bar rendered on every page.
 *
 * Displays:
 *   - App title (click → /tasks)
 *   - Logged-in username
 *   - Role badge (ADMIN in orange, USER in blue)
 *   - Logout button
 *
 * Renders nothing until Keycloak is initialized to avoid flash of
 * incorrect content (e.g. showing "Guest" briefly before auth completes).
 */
export default function Navbar() {
  const { initialized, authenticated, username, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Don't render until Keycloak is ready
  if (!initialized) return null;

  return (
    <nav style={styles.nav}>
      {/* Brand / title */}
      <span
        style={styles.brand}
        onClick={() => navigate('/tasks')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks')}
      >
        📋 Task Management
      </span>

      {/* Right side — user info + logout */}
      {authenticated && (
        <div style={styles.right}>
          {/* Username */}
          <span style={styles.username}>👤 {username}</span>

          {/* Role badge */}
          <span style={isAdmin ? styles.badgeAdmin : styles.badgeUser}>
            {isAdmin ? 'ADMIN' : 'USER'}
          </span>

          {/* Logout */}
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#1F3864', color: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: {
    fontSize: '20px', fontWeight: '700', cursor: 'pointer',
    userSelect: 'none', letterSpacing: '0.5px',
  },
  right: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  username: {
    fontSize: '14px', color: '#cdd9f0',
  },
  badgeAdmin: {
    background: '#e8590c', color: '#fff',
    padding: '3px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px',
  },
  badgeUser: {
    background: '#2E75B6', color: '#fff',
    padding: '3px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid #8da9d4',
    color: '#cdd9f0', padding: '6px 14px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px',
    transition: 'all 0.2s',
  },
};
