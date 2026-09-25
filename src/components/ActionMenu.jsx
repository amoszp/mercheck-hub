import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDismiss } from '../lib/useDismiss.js';

/**
 * Icon button that opens a small glass popover of actions.
 * `items`: [{ label, icon, onSelect, danger? }]
 */
export default function ActionMenu({ icon: TriggerIcon, label, items }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, rootRef);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="glass-btn"
      >
        <TriggerIcon size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            style={{ transformOrigin: 'top right' }}
            className="glass glass-strong absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl p-1.5"
          >
            {items.map(({ label: itemLabel, icon: ItemIcon, onSelect, danger }) => (
              <button
                key={itemLabel}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSelect();
                }}
                className={`menu-item ${danger ? 'text-danger' : ''}`}
              >
                <ItemIcon size={18} className="shrink-0 opacity-80" />
                {itemLabel}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
