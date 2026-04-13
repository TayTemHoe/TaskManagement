import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createTask } from '../services/taskService';
import TaskForm from '../components/TaskForm';

/**
 * CreateTaskPage — form page for creating a new task.
 *
 * Submits POST /api/tasks → returns 202 Accepted.
 * The task is saved to MongoDB asynchronously via Kafka.
 * We wait 1.5 seconds then redirect to the task list so the
 * new task is visible when the list re-fetches.
 *
 * Note: createdBy is NOT in the form — it is set server-side
 * from the JWT preferred_username claim in TaskController.
 */
export default function CreateTaskPage() {
  const navigate  = useNavigate();
  const { token, updateToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData) {
    try {
      setLoading(true);
      setError(null);
      await updateToken(30);
      await createTask(token, formData);
      setSuccess(true);
      // Wait for Kafka consumer to process the event, then redirect
      setTimeout(() => navigate('/tasks'), 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/tasks')}>
        ← Back to Tasks
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Create New Task</h2>
        <p style={styles.subtitle}>
          Fill in the details below. Status must start as PENDING.
        </p>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            ✅ Task creation event sent! Redirecting to task list…
          </div>
        )}

        {!success && (
          <TaskForm
            onSubmit={handleSubmit}
            submitLabel="Create Task"
            loading={loading}
            initialValues={{ status: 'PENDING' }}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  page:       { padding: '24px 32px', maxWidth: '680px', margin: '0 auto' },
  backBtn:    { background: 'none', border: 'none', color: '#2E75B6',
                cursor: 'pointer', fontSize: '14px', marginBottom: '16px',
                padding: 0, fontWeight: '600' },
  card:       { background: '#fff', borderRadius: '12px', padding: '32px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title:      { fontSize: '22px', fontWeight: '700', color: '#1F3864',
                marginBottom: '8px' },
  subtitle:   { color: '#666', fontSize: '14px', marginBottom: '24px' },
  errorBox:   { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
                padding: '12px 16px', color: '#991b1b', marginBottom: '20px',
                fontSize: '14px' },
  successBox: { background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px',
                padding: '12px 16px', color: '#166534', fontSize: '14px' },
};
