import { useState } from 'react';

/**
 * TaskForm — reusable form for creating and updating tasks.
 *
 * Used by:
 *   CreateTaskPage — initialValues = {} (empty form)
 *   UpdateTaskPage — initialValues = existing task data (pre-populated)
 *
 * Props:
 *   initialValues  — { title, description, status, priority, dueDate }
 *   onSubmit(data) — called with the validated form data when submitted
 *   submitLabel    — button text (e.g. "Create Task" or "Save Changes")
 *   loading        — disables the form while the API call is in progress
 *
 * Validation (client-side, mirrors backend rules):
 *   title       — required, max 50 chars
 *   description — required, max 100 chars
 *   status      — required, must be PENDING / IN_PROGRESS / COMPLETED
 *   priority    — required, must be LOW / MEDIUM / HIGH
 *   dueDate     — required, must not be in the past
 */
export default function TaskForm({ initialValues = {}, onSubmit, submitLabel = 'Submit', loading = false }) {
  const [form, setForm] = useState({
    title:       initialValues.title       || '',
    description: initialValues.description || '',
    status:      initialValues.status      || 'PENDING',
    priority:    initialValues.priority    || 'MEDIUM',
    dueDate:     initialValues.dueDate     || '',
  });
  const [errors, setErrors] = useState({});

  // Update a single field
  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Client-side validation
  function validate() {
    const e = {};
    if (!form.title.trim())
      e.title = 'Title is required.';
    else if (form.title.length > 50)
      e.title = 'Title cannot exceed 50 characters.';

    if (!form.description.trim())
      e.description = 'Description is required.';
    else if (form.description.length > 100)
      e.description = 'Description cannot exceed 100 characters.';

    if (!form.status)
      e.status = 'Status is required.';

    if (!form.priority)
      e.priority = 'Priority is required.';

    if (!form.dueDate)
      e.dueDate = 'Due date is required.';
    else if (new Date(form.dueDate) < new Date(new Date().toDateString()))
      e.dueDate = 'Due date cannot be in the past.';

    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Title */}
      <Field label="Title *" error={errors.title}>
        <input
          style={{ ...styles.input, ...(errors.title ? styles.inputErr : {}) }}
          value={form.title}
          onChange={handle('title')}
          placeholder="Enter task title (max 50 chars)"
          maxLength={50}
          disabled={loading}
        />
        <small style={styles.hint}>{form.title.length}/50</small>
      </Field>

      {/* Description */}
      <Field label="Description *" error={errors.description}>
        <textarea
          style={{ ...styles.input, ...styles.textarea, ...(errors.description ? styles.inputErr : {}) }}
          value={form.description}
          onChange={handle('description')}
          placeholder="Enter task description (max 100 chars)"
          maxLength={100}
          rows={3}
          disabled={loading}
        />
        <small style={styles.hint}>{form.description.length}/100</small>
      </Field>

      {/* Status + Priority — side by side */}
      <div style={styles.row}>
        <Field label="Status *" error={errors.status} style={{ flex: 1 }}>
          <select style={styles.select} value={form.status} onChange={handle('status')} disabled={loading}>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </Field>
        <Field label="Priority *" error={errors.priority} style={{ flex: 1 }}>
          <select style={styles.select} value={form.priority} onChange={handle('priority')} disabled={loading}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </Field>
      </div>

      {/* Due Date */}
      <Field label="Due Date *" error={errors.dueDate}>
        <input
          type="date"
          style={{ ...styles.input, ...(errors.dueDate ? styles.inputErr : {}) }}
          value={form.dueDate}
          onChange={handle('dueDate')}
          disabled={loading}
        />
      </Field>

      {/* Submit */}
      <button type="submit" style={styles.btn} disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

/** Reusable field wrapper with label and error message */
function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: '16px', ...style }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  form:     { maxWidth: '560px', display: 'flex', flexDirection: 'column' },
  row:      { display: 'flex', gap: '16px' },
  label:    { display: 'block', marginBottom: '4px', fontWeight: '600',
              fontSize: '14px', color: '#333' },
  input:    { width: '100%', padding: '8px 12px', borderRadius: '6px',
              border: '1px solid #ccc', fontSize: '14px', outline: 'none',
              transition: 'border-color 0.2s' },
  inputErr: { borderColor: '#dc2626' },
  textarea: { resize: 'vertical', minHeight: '72px' },
  select:   { width: '100%', padding: '8px 12px', borderRadius: '6px',
              border: '1px solid #ccc', fontSize: '14px', background: '#fff' },
  hint:     { color: '#999', fontSize: '12px' },
  error:    { color: '#dc2626', fontSize: '13px', marginTop: '4px' },
  btn:      { marginTop: '8px', padding: '10px 24px', borderRadius: '6px',
              background: '#1F3864', color: '#fff', border: 'none',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              alignSelf: 'flex-start', opacity: 1,
              transition: 'opacity 0.2s' },
};
