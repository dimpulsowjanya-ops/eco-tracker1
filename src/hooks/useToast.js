import { useState, useCallback } from 'react';

/**
 * Toast notification system hook.
 * Replaces all alert() / confirm() calls with in-app notifications.
 *
 * @returns {{ toasts: Array, addToast: Function, removeToast: Function }}
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} [type='info']
   * @param {number} [duration=4000] - ms before auto-dismiss
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
