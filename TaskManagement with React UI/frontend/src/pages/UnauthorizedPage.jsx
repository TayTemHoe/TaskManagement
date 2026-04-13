import { useNavigate } from 'react-router-dom';

/**
 * UnauthorizedPage — shown when a user attempts an action they are not
 * permitted to perform (e.g. a USER trying to delete another user's task).
 *
 * Navigating here with state.message passes a specific error message.
 * Usage from another page:
 *   navigate('/unauthorized', { state: { message: 'You cannot delete this task.' } });
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h2 style={styles.title}>Access Denied</h2>
        <p style={styles.msg}>
          You do not have permission to perform this action.
        </p>
        <p style={styles.hint}>
          You can only update or delete tasks that you created.
          ADMIN users can modify any task.
        </p>
        <button style={styles.btn} onClick={() => navigate('/tasks')}>
          Back to Tasks
        </button>
      </div>
    </div>
  );
}

const styles = {
  page:  { display: 'flex', alignItems: 'center', justifyContent: 'center',
           minHeight: '70vh' },
  card:  { background: '#fff', borderRadius: '12px', padding: '40px 48px',
           boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: '420px',
           width: '100%', textAlign: 'center' },
  icon:  { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#dc2626',
           marginBottom: '12px' },
  msg:   { color: '#444', marginBottom: '12px', fontSize: '15px' },
  hint:  { color: '#888', fontSize: '13px', marginBottom: '24px',
           lineHeight: '1.5' },
  btn:   { background: '#1F3864', color: '#fff', border: 'none',
           padding: '10px 28px', borderRadius: '8px', fontSize: '15px',
           fontWeight: '600', cursor: 'pointer' },
};
