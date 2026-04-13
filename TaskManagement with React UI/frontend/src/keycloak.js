import Keycloak from 'keycloak-js';

/**
 * Keycloak instance — created ONCE and exported.
 *
 * WHY created outside React:
 *   keycloak.init() must be called exactly once. If we created the instance
 *   inside a component or hook, React's re-renders could trigger multiple init calls.
 *
 * Configuration comes from Vite env vars (VITE_* prefix):
 *   url      — Keycloak server base URL (e.g. http://localhost:8180)
 *   realm    — The realm name (e.g. internship-task-realm)
 *   clientId — The public client ID (e.g. task-frontend)
 *
 * These are set in .env for local dev and passed as Docker build args
 * in docker-compose.yml for the containerized build.
 */
const keycloak = new Keycloak({
  url:      import.meta.env.VITE_KEYCLOAK_URL      || 'http://localhost:8180',
  realm:    import.meta.env.VITE_KEYCLOAK_REALM    || 'internship-task-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'task-frontend',
});

export default keycloak;
