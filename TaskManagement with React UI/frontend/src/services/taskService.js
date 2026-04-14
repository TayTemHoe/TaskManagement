/**
 * Task API service layer.
 *
 * All functions accept the JWT token and attach it as a Bearer header.
 * Always call useAuth().updateToken(30) BEFORE calling these functions
 * to prevent 401 errors from expired tokens.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const headers = (token) => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${token}`,
});

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

// ── Queries (GET) ─────────────────────────────────────────────

export async function getAllTasks(token) {
  const res = await fetch(`${BASE_URL}/api/tasks`, { headers: headers(token) });
  await checkResponse(res);
  return res.json();
}

export async function getTaskById(token, id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, { headers: headers(token) });
  await checkResponse(res);
  return res.json();
}

// ── Commands (POST / PUT / PATCH / DELETE) ────────────────────
// All return 202 Accepted — changes happen async via Kafka.
// Wait ~1-2 seconds before re-fetching.

export async function createTask(token, taskData) {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method:  'POST',
    headers: headers(token),
    body:    JSON.stringify(taskData),
  });
  await checkResponse(res);
  return res.text();
}

export async function updateTask(token, id, taskData) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method:  'PUT',
    headers: headers(token),
    body:    JSON.stringify(taskData),
  });
  await checkResponse(res);
  return res.text();
}

export async function updateTaskStatus(token, id, newStatus) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}/status`, {
    method:  'PATCH',
    headers: headers(token),
    body:    JSON.stringify({ status: newStatus }),
  });
  await checkResponse(res);
  return res.text();
}

export async function deleteTask(token, id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method:  'DELETE',
    headers: headers(token),
  });
  await checkResponse(res);
  return res.text();
}
