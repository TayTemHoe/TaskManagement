import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTaskById, deleteTask, updateTaskStatus } from '../services/taskService';
import { StatusBadge, PriorityBadge } from '../components/Badges';

/**
 * TaskDetailPage — shows full details of a single task.
 *
 * Actions available (role/ownership conditional):
 *   Edit    — ADMIN always; USER only if task.createdBy === username
 *   Delete  — ADMIN always; USER only if task.createdBy === username
 *   Advance status (PENDING→IN_PROGRESS, IN_PROGRESS→COMPLETED)
 *             — ADMIN always; USER only for own tasks
 *
 * COMPLETED tasks:
 *   Edit and status advance are hidden (task is fully locked).
 *   Delete is still allowed for ADMIN and task owner.
 */
export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, username, isAdmin, updateToken } = useAuth();

  const [task, setTask]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);
  const [busy, setBusy]       = useState(false);

  // ── Fetch task ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        await updateToken(30);
        const data = await getTaskById(token, id);
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, updateToken]);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      setBusy(true);
      await updateToken(30);
      await deleteTask(token, task.id);
      showToast('Task deletion event sent. Returning to list…');
      setTimeout(() => navigate('/tasks'), 1500);
    } catch (err) {
      showToast(err.message.includes('403')
        ? 'You can only delete tasks you created.'
        : err.message, 'error');
      setBusy(false);
    }
  }

  // ── Advance status ───────────────────────────────────────────
  async function handleAdvanceStatus() {
    const next = task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      setBusy(true);
      await updateToken(30);
      await updateTaskStatus(token, task.id, next);
      showToast(`Status → ${next}. Refreshing…`);
      // Re-fetch after Kafka processes
      setTimeout(async () => {
        const updated = await getTaskById(token, task.id);
        setTask(updated);
        setBusy(false);
      }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
      setBusy(false);
    }
  }

  const canModify = task && (isAdmin || task.createdBy === username);

  // ── Render ───────────────────────────────────────────────────
  if (loading) return <div style={styles.page}><p style={styles.info}>Loading task…</p></div>;
  if (error)   return (
    <div style={styles.page}>
      <div style={styles.errorBox}>{error}</div>
      <button style={styles.backBtn} onClick={() => navigate('/tasks')}>← Back</button>
    </div>
  );
  if (!task)   return null;

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast,
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color:      toast.type === 'error' ? '#991b1b' : '#166534',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <button style={styles.backBtn} onClick={() => navigate('/tasks')}>
        ← Back to Tasks
      </button>

      <div style={styles.card}>
        {/* Title + badges */}
        <div style={styles.titleRow}>
          <h2 style={styles.taskTitle}>{task.title}</h2>
          <div style={styles.badges}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        {/* Details grid */}
        <div style={styles.grid}>
          <Detail label="Task ID"      value={task.id} />
          <Detail label="Due Date"     value={task.dueDate} />
          <Detail label="Created By"   value={
            <span style={task.createdBy === username ? styles.ownLabel : {}}>
              {task.createdBy || '—'}{task.createdBy === username ? ' (you)' : ''}
            </span>
          } />
          <Detail label="Updated By"   value={task.updatedBy || '—'} />
          <Detail label="Created At"   value={task.createdAt ? task.createdAt.replace('T', ' ').slice(0, 19) : '—'} />
          <Detail label="Updated At"   value={task.updatedAt ? task.updatedAt.replace('T', ' ').slice(0, 19) : '—'} />
        </div>

        {/* Description */}
        <div style={styles.descBox}>
          <p style={styles.descLabel}>Description</p>
          <p style={styles.descText}>{task.description}</p>
        </div>

        {/* Action buttons */}
        <div style={styles.actions}>
          {/* Advance status — hidden for COMPLETED */}
          {canModify && task.status !== 'COMPLETED' && (
            <button style={styles.btnStatus} onClick={handleAdvanceStatus} disabled={busy}>
              {task.status === 'PENDING' ? '▶ Mark In Progress' : '✓ Mark Completed'}
            </button>
          )}

          {/* Edit — hidden for COMPLETED or non-owners */}
          {canModify && task.status !== 'COMPLETED' && (
            <button style={styles.btnEdit}
              onClick={() => navigate(`/tasks/${task.id}/edit`)}>
              ✏ Edit Task
            </button>
          )}

          {/* Delete — always available to owner/admin */}
          {canModify && (
            <button style={styles.btnDelete} onClick={handleDelete} disabled={busy}>
              🗑 Delete Task
            </button>
          )}

          {/* No actions message for non-owners */}
          {!canModify && (
            <p style={styles.noAction}>
              You can only modify tasks you created.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: '#222', fontWeight: '500' }}>{value}</p>
    </div>
  );
}

const styles = {
  page:      { padding: '24px 32px', maxWidth: '720px', margin: '0 auto' },
  info:      { color: '#666' },
  backBtn:   { background: 'none', border: 'none', color: '#2E75B6',
               cursor: 'pointer', fontSize: '14px', marginBottom: '16px',
               padding: 0, fontWeight: '600' },
  card:      { background: '#fff', borderRadius: '12px', padding: '32px',
               boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  titleRow:  { display: 'flex', justifyContent: 'space-between',
               alignItems: 'flex-start', marginBottom: '20px', gap: '12px' },
  taskTitle: { fontSize: '22px', fontWeight: '700', color: '#1F3864', flex: 1 },
  badges:    { display: 'flex', gap: '8px', flexShrink: 0 },
  grid:      { display: 'grid', gridTemplateColumns: '1fr 1fr',
               gap: '0 24px', marginBottom: '20px' },
  descBox:   { background: '#f8faff', borderRadius: '8px', padding: '16px',
               marginBottom: '24px' },
  descLabel: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  descText:  { fontSize: '14px', color: '#333', lineHeight: '1.6' },
  ownLabel:  { color: '#1d4ed8', fontWeight: '600' },
  actions:   { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  btnStatus: { padding: '9px 18px', borderRadius: '7px', fontSize: '14px',
               fontWeight: '600', cursor: 'pointer',
               border: '1.5px solid #7c3aed', color: '#7c3aed', background: '#fff' },
  btnEdit:   { padding: '9px 18px', borderRadius: '7px', fontSize: '14px',
               fontWeight: '600', cursor: 'pointer',
               border: '1.5px solid #059669', color: '#059669', background: '#fff' },
  btnDelete: { padding: '9px 18px', borderRadius: '7px', fontSize: '14px',
               fontWeight: '600', cursor: 'pointer',
               border: '1.5px solid #dc2626', color: '#dc2626', background: '#fff' },
  noAction:  { color: '#888', fontSize: '13px', fontStyle: 'italic' },
  errorBox:  { background: '#fee2e2', border: '1px solid #fca5a5',
               borderRadius: '8px', padding: '16px', color: '#991b1b',
               marginBottom: '16px' },
  toast:     { position: 'fixed', top: '80px', right: '24px', zIndex: 200,
               padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
               maxWidth: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
};
