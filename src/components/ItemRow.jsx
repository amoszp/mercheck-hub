import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import InlineEdit from './InlineEdit.jsx';

const rowTransition = { type: 'spring', stiffness: 420, damping: 34 };

/**
 * `checked` means "still to buy": the row stays bright and sorts to the top.
 * Unchecking marks it as collected: dimmed, struck through, moved to the bottom.
 *
 * The ref is forwarded because AnimatePresence's popLayout mode measures the
 * exiting element through it.
 */
const ItemRow = forwardRef(function ItemRow(
  { item, showQuantity, onToggle, onRename, onQuantity, onDelete },
  ref,
) {
  const [editing, setEditing] = useState(false);

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: item.checked ? 1 : 0.5, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={rowTransition}
      className="flex items-center rounded-2xl pr-1"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={`${item.name}, ${item.checked ? 'to buy' : 'collected'}`}
        // Toggling on mousedown (not click) keeps the search field's focus, so
        // the mobile keyboard doesn't collapse and shift the list mid-tap.
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          onToggle();
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      >
        <span className={`check ${item.checked ? 'check--on' : ''}`}>
          {item.checked && <Check size={13} strokeWidth={3.5} aria-hidden />}
        </span>
      </button>

      {editing ? (
        <InlineEdit
          value={item.name}
          label="Item name"
          className="mx-1 min-w-0 flex-1 px-3 py-1.5"
          onCommit={(name) => {
            onRename(name);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 px-1 py-2 text-left text-[15px] leading-snug"
        >
          <span
            className={`line-clamp-2 break-words ${
              item.checked ? 'text-fg' : 'text-fg/70 line-through decoration-fg/40'
            }`}
          >
            {item.name}
          </span>
        </button>
      )}

      {showQuantity && (
        <div className="stepper shrink-0">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={item.quantity <= 1}
            onClick={() => onQuantity(-1)}
            className="disabled:opacity-30"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="min-w-5 text-center text-sm font-semibold tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label={`Increase quantity of ${item.name}`}
            onClick={() => onQuantity(1)}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label={`Delete ${item.name}`}
        onClick={onDelete}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg/35 transition hover:text-danger active:scale-90"
      >
        <Trash2 size={16} />
      </button>
    </motion.li>
  );
});

export default ItemRow;
