import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage — shown at /login.
 *
 * If the user is already authenticated (e.g. navigated to /login directly),
 * redirect them to /tasks immediately.
 *
 * Otherwise show a login button that triggers the Keycloak Authorization Code
 * Flow — redirects to the Keycloak login page.
 *
 * After successful login, Keycloak redirects back to the app and
 * ReactKeycloakProvider sets keycloak.authenticated = true.
 */
export default function LoginPage() {
  const { initialized, authenticated, login } = useAuth();
  const navigate = useNavigate();

  // If already logged in, go to the task list
  useEffect(() => {
    if (initialized && authenticated) {
      navigate('/tasks', { replace: true });
    }
  }, [initialized, authenticated, navigate]);

  if (!initialized) {
    return (
      <div style={styles.page}>
        <p style={styles.loading}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📋 Task Management</h1>
        <p style={styles.subtitle}>
          Sign in with your Keycloak account to manage your tasks.
        </p>

        <div style={styles.info}>
          <p style={styles.infoTitle}>Demo accounts</p>
          <p style={styles.infoRow}><strong>admin1</strong> / admin123 — full access (ADMIN role)</p>
          <p style={styles.infoRow}><strong>user1</strong>  / user123  — own tasks only (USER role)</p>
          <p style={styles.infoRow}><strong>user2</strong>  / user123  — own tasks only (USER role)</p>
        </div>

        <button style={styles.btn} onClick={login}>
          Login with Keycloak
        </button>
      </div>
    </div>
  );
}

const styles = {
  page:      { display: 'flex', alignItems: 'center', justifyContent: 'center',
               minHeight: '80vh', padding: '24px' },
  card:      { background: '#fff', borderRadius: '12px', padding: '40px 48px',
               boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: '440px',
               width: '100%', textAlign: 'center' },
  title:     { fontSize: '26px', fontWeight: '700', color: '#1F3864',
               marginBottom: '12px' },
  subtitle:  { color: '#555', marginBottom: '24px', fontSize: '15px',
               lineHeight: '1.5' },
  info:      { background: '#f0f4ff', borderRadius: '8px', padding: '16px',
               marginBottom: '24px', textAlign: 'left' },
  infoTitle: { fontWeight: '700', color: '#1F3864', marginBottom: '8px',
               fontSize: '14px' },
  infoRow:   { fontSize: '13px', color: '#444', marginBottom: '4px' },
  btn:       { background: '#1F3864', color: '#fff', border: 'none',
               padding: '12px 32px', borderRadius: '8px', fontSize: '16px',
               fontWeight: '600', cursor: 'pointer', width: '100%',
               transition: 'background 0.2s' },
  loading:   { color: '#888', fontSize: '16px' },
};
