import { useKeycloak } from '@react-keycloak/web';

/**
 * Custom hook: useAuth
 *
 * Follows the O'Reilly course pattern of extracting repeated logic into hooks.
 * Any component that needs auth info imports useAuth() instead of useKeycloak().
 *
 * Returns:
 *   initialized  — true once Keycloak has completed its init (check-sso)
 *   authenticated — true if the user is logged in
 *   username     — preferred_username from JWT (e.g. "alice")
 *   roles        — array of realm roles from JWT (e.g. ["USER", "offline_access"])
 *   isAdmin      — true if roles includes "ADMIN"
 *   isUser       — true if roles includes "USER"
 *   token        — current access token string (for Authorization: Bearer header)
 *   login()      — redirects to Keycloak login page
 *   logout()     — ends the session and redirects to app root
 *   updateToken  — refreshes the token if it expires within minValidity seconds
 *                  Call before every API request to prevent 401 from expired token
 *
 * Usage example:
 *   const { username, isAdmin, token, updateToken } = useAuth();
 *   await updateToken(30);   // refresh if expiring in < 30 seconds
 *   fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` }});
 */
export function useAuth() {
  const { keycloak, initialized } = useKeycloak();

  // Extract roles from JWT claim: realm_access.roles
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];

  return {
    initialized,
    authenticated: keycloak?.authenticated || false,
    username:      keycloak?.tokenParsed?.preferred_username || '',
    roles,
    isAdmin:       roles.includes('ADMIN'),
    isUser:        roles.includes('USER'),
    token:         keycloak?.token || '',

    // Redirect user to Keycloak login page
    login: () => keycloak?.login(),

    // End session and return to app origin
    logout: () => keycloak?.logout({ redirectUri: window.location.origin }),

    /**
     * Refresh the token if it expires within minValidity seconds.
     * Always call this before making an API request to avoid 401 errors
     * from expired tokens (default lifespan is 5 minutes).
     *
     * Returns a Promise — use with await or .then()
     */
    updateToken: (minValidity = 30) =>
      keycloak?.updateToken(minValidity) ?? Promise.resolve(false),
  };
}
