import { useAuth } from '../hooks/useAuth';

/**
 * PrivateRoute — protects any route that requires authentication.
 *
 * Behaviour:
 *   1. While Keycloak is still initializing (check-sso in progress)
 *      → show a loading spinner so the page doesn't flash.
 *
 *   2. If Keycloak has finished initializing and the user is NOT authenticated
 *      → call keycloak.login() which redirects to the Keycloak login page.
 *      → render a brief "Redirecting…" message while the redirect happens.
 *
 *   3. If the user IS authenticated → render the protected children.
 *
 * Usage in App.jsx:
 *   <Route path="/tasks" element={<PrivateRoute><TaskListPage /></PrivateRoute>} />
 */
export default function PrivateRoute({ children }) {
  const { initialized, authenticated, login } = useAuth();

  // Step 1: Keycloak not ready yet — show loading
  if (!initialized) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.text}>Loading authentication…</p>
      </div>
    );
  }

  // Step 2: Not authenticated — trigger Keycloak redirect
  if (!authenticated) {
    login();
    return (
      <div style={styles.center}>
        <p style={styles.text}>Redirecting to login…</p>
      </div>
    );
  }

  // Step 3: Authenticated — render the protected page
  return children;
}

const styles = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '60vh', gap: '16px',
  },
  spinner: {
    width: '40px', height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #2E75B6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: { color: '#666', fontSize: '16px' },
};
