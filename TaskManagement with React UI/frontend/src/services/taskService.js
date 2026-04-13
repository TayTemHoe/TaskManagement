/**
 * Task API service layer.
 *
 * All functions accept the current JWT token as a parameter and attach it
 * to the Authorization: Bearer header. This is how the React frontend
 * proves its identity to the Spring Boot backend.
 *
 * The backend's SecurityConfig requires a valid Keycloak JWT on all /api/tasks
 * endpoints. Without the header, Spring Security returns 401 Unauthorized.
 *
 * Token refresh:
 *   Always call useAuth().updateToken(30) BEFORE calling these functions.
 *   If the access token is within 30 seconds of expiry, Keycloak automatically
 *   issues a new one using the refresh token. This prevents 401 errors mid-session.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/** Build request headers with Content-Type and Authorization */
const headers = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

/**
 * Check HTTP response — throw a descriptive error for non-OK status codes.
 * Parses the backend's ErrorResponse JSON body when available.
 */
async function checkResponse(res) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch (_) { /* ignore parse errors */ }
    throw new Error(message);
  }
  return res;
}

// ── Query operations (GET) ────────────────────────────────────

/**
 * GET /api/tasks
 * Returns an array of TaskResponseDTO objects.
 */
export async function getAllTasks(token) {
  const res = await fetch(`${BASE_URL}/api/tasks`, { headers: headers(token) });
  await checkResponse(res);
  return res.json();
}

/**
 * GET /api/tasks/{id}
 * Returns a single TaskResponseDTO or throws TaskNotFoundException (404).
 */
export async function getTaskById(token, id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, { headers: headers(token) });
  await checkResponse(res);
  return res.json();
}

// ── Command operations (POST/PUT/PATCH/DELETE) ────────────────
// All return 202 Accepted — task changes happen async via Kafka.
// Wait ~1-2 seconds before re-fetching the task list.

/**
 * POST /api/tasks
 * Creates a new task. Returns the 202 message string.
 * taskData: { title, description, status, priority, dueDate }
 *           createdBy is NOT included — backend reads it from the JWT.
 */
export async function createTask(token, taskData) {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(taskData),
  });
  await checkResponse(res);
  return res.text(); // "Task creation event published. Task ID: TASK-XXXXXXXX"
}

/**
 * PUT /api/tasks/{id}
 * Full update — all fields. Only works when task is PENDING.
 */
export async function updateTask(token, id, taskData) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(taskData),
  });
  await checkResponse(res);
  return res.text();
}

/**
 * PATCH /api/tasks/{id}/status
 * Status-only update: { "status": "IN_PROGRESS" }
 */
export async function updateTaskStatus(token, id, newStatus) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}/status`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status: newStatus }),
  });
  await checkResponse(res);
  return res.text();
}

/**
 * DELETE /api/tasks/{id}
 * USER can only delete their own tasks (ownership check in backend).
 * ADMIN can delete any task.
 */
export async function deleteTask(token, id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  await checkResponse(res);
  return res.text();
}
