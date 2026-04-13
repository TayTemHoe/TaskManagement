import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTaskById, updateTask } from '../services/taskService';
import TaskForm from '../components/TaskForm';

/**
 * UpdateTaskPage — pre-populated form for editing an existing task.
 *
 * Access rules (enforced by both frontend and backend):
 *   ADMIN — can edit any task that is not COMPLETED
 *   USER  — can only edit tasks they created that are not COMPLETED
 *   Anyone trying to edit a COMPLETED task is redirected away
 *
 * On load: fetches the current task data to pre-populate the form.
 * On submit: sends PUT /api/tasks/{id} → 202 Accepted.
 * After 1.5 seconds (Kafka processing): redirects to task detail page.
 */
export default function UpdateTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, username, isAdmin, updateToken } = useAuth();

  const [task, setTask]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  // ── Load existing task data ──────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        await updateToken(30);
        const data = await getTaskById(token, id);
        setTask(data);

        // Guard: COMPLETED tasks cannot be edited
        if (data.status === 'COMPLETED') {
          navigate(`/tasks/${id}`, { replace: true });
          return;
        }
        // Guard: USER can only edit their own tasks
        if (!isAdmin && data.createdBy !== username) {
          navigate('/unauthorized', { replace: true });
          return;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, username, isAdmin, updateToken, navigate]);

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(formData) {
    try {
      setSaving(true);
      setError(null);
      await updateToken(30);
      await updateTask(token, id, formData);
      setSuccess(true);
      setTimeout(() => navigate(`/tasks/${id}`), 1500);
    } catch (err) {
      setError(err.message.includes('403')
        ? 'You can only edit tasks you created.'
        : err.message);
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  if (loading) return <div style={styles.page}><p style={styles.info}>Loading task…</p></div>;
  if (!task && error) return (
    <div style={styles.page}>
      <p style={styles.errorMsg}>{error}</p>
      <button style={styles.backBtn} onClick={() => navigate('/tasks')}>← Back</button>
    </div>
  );
  if (!task) return null;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate(`/tasks/${id}`)}>
        ← Back to Task
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Edit Task</h2>
        <p style={styles.subtitle}>
          Editing: <strong>{task.id}</strong>
          {task.status === 'IN_PROGRESS' && (
            <span style={styles.warn}>
              {' '}— Task is IN_PROGRESS. Only status changes are accepted.
            </span>
          )}
        </p>

        {error && (
          <div style={styles.errorBox}><strong>Error:</strong> {error}</div>
        )}

        {success && (
          <div style={styles.successBox}>
            ✅ Update event sent! Redirecting…
          </div>
        )}

        {!success && (
          <TaskForm
            initialValues={{
              title:       task.title,
              description: task.description,
              status:      task.status,
              priority:    task.priority,
              dueDate:     task.dueDate,
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  page:       { padding: '24px 32px', maxWidth: '680px', margin: '0 auto' },
  info:       { color: '#666' },
  backBtn:    { background: 'none', border: 'none', color: '#2E75B6',
                cursor: 'pointer', fontSize: '14px', marginBottom: '16px',
                padding: 0, fontWeight: '600' },
  card:       { background: '#fff', borderRadius: '12px', padding: '32px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title:      { fontSize: '22px', fontWeight: '700', color: '#1F3864',
                marginBottom: '8px' },
  subtitle:   { color: '#666', fontSize: '14px', marginBottom: '24px' },
  warn:       { color: '#d97706', fontWeight: '600' },
  errorBox:   { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
                padding: '12px 16px', color: '#991b1b', marginBottom: '20px',
                fontSize: '14px' },
  errorMsg:   { color: '#dc2626', marginBottom: '16px' },
  successBox: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px',
                padding: '12px 16px', color: '#166534', fontSize: '14px' },
};
