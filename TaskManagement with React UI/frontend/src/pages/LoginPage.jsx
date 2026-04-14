import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const { initialized, authenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && authenticated) {
      navigate('/tasks', { replace: true });
    }
  }, [initialized, authenticated, navigate]);

  if (!initialized) {
    return (
      <div className="login-page">
        <p className="login-card__loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">📋</div>
        <h1 className="login-card__title">Task Management</h1>
        <p className="login-card__subtitle">
          Sign in with your Keycloak account to manage your tasks.
        </p>

        <div className="login-card__demo">
          <p className="login-card__demo-title">Demo accounts</p>
          <p className="login-card__demo-row">
            <strong>admin1</strong> / admin123 — full access (ADMIN)
          </p>
          <p className="login-card__demo-row">
            <strong>user1</strong> / user123 — own tasks only (USER)
          </p>
          <p className="login-card__demo-row">
            <strong>user2</strong> / user123 — own tasks only (USER)
          </p>
        </div>

        <button className="login-card__btn" onClick={login}>
          Login with Keycloak
        </button>
      </div>
    </div>
  );
}
