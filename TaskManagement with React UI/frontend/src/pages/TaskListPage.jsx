import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllTasks, deleteTask, updateTaskStatus } from '../services/taskService';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import './TaskListPage.css';

export default function TaskListPage() {
  const navigate = useNavigate();
  const { token, username, isAdmin, updateToken } = useAuth();

  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [deleting, setDeleting] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────
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

  // ── Toast ────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      setDeleting(task.id);
      await updateToken(30);
      await deleteTask(token, task.id);
      showToast(`"${task.title}" deletion event sent. Refreshing…`);
      setTimeout(fetchTasks, 1500);
    } catch (err) {
      showToast(
        err.message.includes('403')
          ? 'You can only delete tasks you created.'
          : err.message,
        'error'
      );
    } finally {
      setDeleting(null);
    }
  }

  // ── Status advance ───────────────────────────────────────────
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

  const canModify = (task) => isAdmin || task.createdBy === username;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="page">

      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="task-list__header">
        <div>
          <h1 className="task-list__title">All Tasks</h1>
          {!loading && !error && (
            <p className="task-list__subtitle">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <button className="btn btn--primary" onClick={() => navigate('/tasks/new')}>
          + New Task
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading tasks…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="task-list__error">
          <strong>Error:</strong> {error}
          <button className="task-list__retry-btn" onClick={fetchTasks}>
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No tasks yet</p>
          <p className="empty-state__subtitle">
            Create your first task to get started.
          </p>
          <button className="btn btn--primary" onClick={() => navigate('/tasks/new')}>
            Create Task
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && tasks.length > 0 && (
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                {['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Created By', 'Actions']
                  .map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <span
                      className="task-table__id-link"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.id}
                    </span>
                  </td>
                  <td>{task.title}</td>
                  <td><StatusBadge status={task.status} /></td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td>{task.dueDate}</td>
                  <td>
                    <span className={task.createdBy === username ? 'task-table__own-tag' : ''}>
                      {task.createdBy || '—'}
                      {task.createdBy === username && ' (you)'}
                    </span>
                  </td>
                  <td>
                    <div className="task-table__actions">
                      <button
                        className="btn btn--sm btn--outline-blue"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        View
                      </button>

                      {canModify(task) && task.status !== 'COMPLETED' && (
                        <button
                          className="btn btn--sm btn--outline-green"
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                        >
                          Edit
                        </button>
                      )}

                      {canModify(task) && task.status !== 'COMPLETED' && (
                        <button
                          className="btn btn--sm btn--outline-purple"
                          onClick={() => handleAdvanceStatus(task)}
                        >
                          {task.status === 'PENDING' ? '▶ Start' : '✓ Done'}
                        </button>
                      )}

                      {canModify(task) && (
                        <button
                          className="btn btn--sm btn--outline-red"
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
