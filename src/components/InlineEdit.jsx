import { useRef } from 'react';

/**
 * Text field for rename-in-place. Commits on Enter/blur, cancels on Escape.
 * The cancel flag makes Escape deterministic: it never falls through to the
 * blur handler as a commit.
 */
export default function InlineEdit({ value, label, className = '', onCommit, onCancel }) {
  const cancelled = useRef(false);

  return (
    <input
      autoFocus
      defaultValue={value}
      aria-label={label}
      enterKeyHint="done"
      autoComplete="off"
      onFocus={(e) => e.target.select()}
      onBlur={(e) => (cancelled.current ? onCancel() : onCommit(e.target.value))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      className={`field ${className}`}
    />
  );
}
