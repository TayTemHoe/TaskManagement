import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllTasks, deleteTask, updateTaskStatus } from '../services/taskService';
import { StatusBadge, PriorityBadge } from '../components/Badges';

/**
 * TaskListPage — main dashboard.
 *
 * Features:
 *   - Fetches and displays all tasks in a table
 *   - Loading state while fetching
 *   - Empty state when no tasks exist
 *   - Error state on fetch failure
 *   - Create task button (all authenticated users)
 *   - Edit button: ADMIN always; USER only for own tasks
 *   - Delete button: ADMIN always; USER only for own tasks
 *   - Quick status advance button (IN_PROGRESS / COMPLETE shortcut)
 *   - Success/error toast messages after mutations
 *
 * Async note:
 *   POST/PUT/DELETE operations are async via Kafka — the task is saved to
 *   MongoDB after the Kafka consumer processes the event (~1-2 seconds).
 *   After a mutation we wait 1.5 seconds then re-fetch the list.
 */
export default function TaskListPage() {
  const navigate = useNavigate();
  const { token, username, isAdmin, updateToken } = useAuth();

  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);   // { msg, type: 'success'|'error' }
  const [deleting, setDeleting] = useState(null); // taskId being deleted

  // ── Fetch tasks ──────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await updateToken(30);
      const data = await getAllTasks(token);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, updateToken]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Show toast ───────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Delete handler ───────────────────────────────────────────
  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      setDeleting(task.id);
      await updateToken(30);
      await deleteTask(token, task.id);
      showToast(`Task "${task.title}" deletion event sent. Refreshing…`);
      // Wait for Kafka consumer to process the delete
      setTimeout(fetchTasks, 1500);
    } catch (err) {
      showToast(err.message.includes('403')
        ? 'You can only delete tasks you created.'
        : err.message, 'error');
    } finally {
      setDeleting(null);
    }
  }

  // ── Quick status advance ─────────────────────────────────────
  async function handleAdvanceStatus(task) {
    const next = task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await updateToken(30);
      await updateTaskStatus(token, task.id, next);
      showToast(`Status updated to ${next}. Refreshing…`);
      setTimeout(fetchTasks, 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ── Ownership check ──────────────────────────────────────────
  const canModify = (task) => isAdmin || task.createdBy === username;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* Toast notification */}
      {toast && (
        <div style={{ ...styles.toast,
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color:      toast.type === 'error' ? '#991b1b' : '#166534',
          border:     `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>All Tasks</h1>
        <button style={styles.createBtn} onClick={() => navigate('/tasks/new')}>
          + New Task
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={styles.info}>Loading tasks…</p>}

      {/* Error */}
      {!loading && error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
          <button style={styles.retryBtn} onClick={fetchTasks}>Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No tasks yet.</p>
          <button style={styles.createBtn} onClick={() => navigate('/tasks/new')}>
            Create your first task
          </button>
        </div>
      )}

      {/* Task table */}
      {!loading && !error && tasks.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID','Title','Status','Priority','Due Date','Created By','Actions']
                  .map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <tr key={task.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8faff' }}>
                  <td style={styles.td}>
                    <span
                      style={styles.idLink}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.id}
                    </span>
                  </td>
                  <td style={styles.td}>{task.title}</td>
                  <td style={styles.td}><StatusBadge status={task.status} /></td>
                  <td style={styles.td}><PriorityBadge priority={task.priority} /></td>
                  <td style={styles.td}>{task.dueDate}</td>
                  <td style={styles.td}>
                    <span style={task.createdBy === username ? styles.ownTag : {}}>
                      {task.createdBy || '—'}
                      {task.createdBy === username && ' (you)'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {/* View */}
                      <button
                        style={styles.btnView}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        View
                      </button>

                      {/* Edit — only for ADMIN or task owner */}
                      {canModify(task) && task.status !== 'COMPLETED' && (
                        <button
                          style={styles.btnEdit}
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                        >
                          Edit
                        </button>
                      )}

                      {/* Advance status — PENDING→IN_PROGRESS or IN_PROGRESS→COMPLETED */}
                      {canModify(task) && task.status !== 'COMPLETED' && (
                        <button
                          style={styles.btnStatus}
                          onClick={() => handleAdvanceStatus(task)}
                        >
                          {task.status === 'PENDING' ? '▶ Start' : '✓ Done'}
                        </button>
                      )}

                      {/* Delete — only for ADMIN or task owner */}
                      {canModify(task) && (
                        <button
                          style={styles.btnDelete}
                          onClick={() => handleDelete(task)}
                          disabled={deleting === task.id}
                        >
                          {deleting === task.id ? '…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:      { padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' },
  header:    { display: 'flex', justifyContent: 'space-between',
               alignItems: 'center', marginBottom: '20px' },
  title:     { fontSize: '24px', fontWeight: '700', color: '#1F3864' },
  info:      { color: '#666', padding: '20px 0' },
  createBtn: { background: '#1F3864', color: '#fff', border: 'none',
               padding: '9px 20px', borderRadius: '8px', fontSize: '14px',
               fontWeight: '600', cursor: 'pointer' },
  tableWrap: { overflowX: 'auto', borderRadius: '10px',
               boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  table:     { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  th:        { background: '#1F3864', color: '#fff', padding: '12px 14px',
               textAlign: 'left', fontSize: '13px', fontWeight: '600',
               whiteSpace: 'nowrap' },
  td:        { padding: '10px 14px', borderBottom: '1px solid #eee',
               fontSize: '14px', verticalAlign: 'middle' },
  idLink:    { color: '#2E75B6', fontWeight: '600', cursor: 'pointer',
               textDecoration: 'underline', fontSize: '13px' },
  ownTag:    { color: '#1d4ed8', fontWeight: '600' },
  actions:   { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  btnView:   { padding: '4px 10px', borderRadius: '5px', fontSize: '12px',
               cursor: 'pointer', border: '1px solid #2E75B6',
               color: '#2E75B6', background: '#fff' },
  btnEdit:   { padding: '4px 10px', borderRadius: '5px', fontSize: '12px',
               cursor: 'pointer', border: '1px solid #059669',
               color: '#059669', background: '#fff' },
  btnStatus: { padding: '4px 10px', borderRadius: '5px', fontSize: '12px',
               cursor: 'pointer', border: '1px solid #7c3aed',
               color: '#7c3aed', background: '#fff' },
  btnDelete: { padding: '4px 10px', borderRadius: '5px', fontSize: '12px',
               cursor: 'pointer', border: '1px solid #dc2626',
               color: '#dc2626', background: '#fff' },
  errorBox:  { background: '#fee2e2', border: '1px solid #fca5a5',
               borderRadius: '8px', padding: '16px', color: '#991b1b',
               display: 'flex', alignItems: 'center', gap: '12px' },
  retryBtn:  { background: '#991b1b', color: '#fff', border: 'none',
               padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' },
  emptyBox:  { textAlign: 'center', padding: '60px 20px' },
  emptyText: { fontSize: '18px', color: '#888', marginBottom: '16px' },
  toast:     { position: 'fixed', top: '80px', right: '24px', zIndex: 200,
               padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
               maxWidth: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
};
