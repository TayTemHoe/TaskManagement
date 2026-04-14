import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './NavBar.module.css';

export default function Navbar() {
  const { initialized, authenticated, username, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!initialized) return null;

  return (
    <nav className="navbar">
      <span
        className="navbar__brand"
        onClick={() => navigate('/tasks')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks')}
      >
        <span className="navbar__brand-icon">📋</span>
        Task Management
      </span>

      {authenticated && (
        <div className="navbar__right">
          <span className="navbar__username">👤 {username}</span>

          <span className={`navbar__role-badge ${isAdmin ? 'navbar__role-badge--admin' : 'navbar__role-badge--user'}`}>
            {isAdmin ? 'ADMIN' : 'USER'}
          </span>

          <button className="navbar__logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
