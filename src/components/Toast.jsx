import React, { useEffect, useRef } from 'react';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLORS = {
  success: 'var(--color-success)',
  error:   'var(--color-danger)',
  warning: 'var(--color-warning)',
  info:    'var(--color-primary)',
};

/**
 * Individual toast notification.
 * Accessible: uses role="alert" and aria-live="polite".
 */
function Toast({ id, message, type = 'info', onRemove }) {
  const ref = useRef(null);

  useEffect(() => {
    // Animate in
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateX(100%)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateX(0)';
        }
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className="toast"
      style={{ borderLeft: `4px solid ${COLORS[type]}` }}
    >
      <span aria-hidden="true" className="toast__icon">{ICONS[type]}</span>
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Toast container — renders all active notifications.
 * Positioned fixed at top-right for visibility.
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      className="toast-container"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}
