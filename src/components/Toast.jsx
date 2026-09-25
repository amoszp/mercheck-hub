import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TOAST_MS = 6000;

/** Bottom notice with an optional Undo action (shown when `toast.restore` exists). */
export default function Toast({ toast, onUndo, onDismiss }) {
  const toastId = toast?.id;

  useEffect(() => {
    if (!toastId) return undefined;
    const timer = setTimeout(onDismiss, TOAST_MS);
    return () => clearTimeout(timer);
  }, [toastId, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] z-40 flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass glass-strong pointer-events-auto flex max-w-full items-center gap-2 rounded-full py-2 pl-5 pr-2 text-sm"
          >
            <span className="truncate">{toast.message}</span>
            {toast.restore && (
              <button
                type="button"
                onClick={onUndo}
                className="shrink-0 rounded-full bg-accent/15 px-3.5 py-1.5 font-semibold text-accent-text transition active:scale-95"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
