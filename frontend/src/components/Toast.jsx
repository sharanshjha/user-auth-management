import { useEffect } from 'react';

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast-${toast.type || 'info'}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
};

export default Toast;
