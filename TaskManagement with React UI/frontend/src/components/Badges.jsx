/**
 * StatusBadge — colored pill for task status values.
 *
 * PENDING     → grey
 * IN_PROGRESS → blue
 * COMPLETED   → green
 */
export function StatusBadge({ status }) {
  const map = {
    PENDING:     { bg: '#f0f0f0', color: '#555',    label: 'PENDING'      },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1d4ed8', label: 'IN PROGRESS'  },
    COMPLETED:   { bg: '#dcfce7', color: '#166534', label: 'COMPLETED'    },
  };
  const s = map[status] || { bg: '#f0f0f0', color: '#555', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

/**
 * PriorityBadge — colored pill for task priority values.
 *
 * LOW    → green
 * MEDIUM → amber
 * HIGH   → red
 */
export function PriorityBadge({ priority }) {
  const map = {
    LOW:    { bg: '#dcfce7', color: '#166534', label: 'LOW'    },
    MEDIUM: { bg: '#fef9c3', color: '#854d0e', label: 'MEDIUM' },
    HIGH:   { bg: '#fee2e2', color: '#991b1b', label: 'HIGH'   },
  };
  const p = map[priority] || { bg: '#f0f0f0', color: '#555', label: priority };
  return (
    <span style={{
      background: p.bg, color: p.color,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
    }}>
      {p.label}
    </span>
  );
}
