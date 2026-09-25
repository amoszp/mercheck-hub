import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ellipsis, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import ActionMenu from './ActionMenu.jsx';
import InlineEdit from './InlineEdit.jsx';
import ItemRow from './ItemRow.jsx';

const cardTransition = { type: 'spring', stiffness: 260, damping: 28 };

// Items still to buy come first; collected ones sink to the bottom.
const sortItems = (items) => [
  ...items.filter((item) => item.checked),
  ...items.filter((item) => !item.checked),
];

export default function ListCard({ list, isActive, autoEdit, showQuantity, actions }) {
  const [query, setQuery] = useState('');
  const [editingName, setEditingName] = useState(autoEdit);
  const finderRef = useRef(null);

  const total = list.items.length;
  const collected = list.items.filter((item) => !item.checked).length;
  const progress = total ? (collected / total) * 100 : 0;

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const sorted = sortItems(list.items);
    return q ? sorted.filter((item) => item.name.toLowerCase().includes(q)) : sorted;
  }, [list.items, q]);

  const canAdd = q.length > 0 && !list.items.some((item) => item.name.toLowerCase() === q);

  const addFromQuery = () => {
    actions.addItem(list.id, query);
    setQuery('');
    requestAnimationFrame(() => finderRef.current?.focus());
  };

  const handleToggle = (itemId) => {
    actions.toggleItem(list.id, itemId);
    setQuery('');
    document.activeElement?.blur();
  };

  // Enter adds when nothing matches; otherwise it just dismisses the keyboard.
  const handleFinderKey = (e) => {
    if (e.key !== 'Enter') return;
    if (canAdd && visible.length === 0) addFromQuery();
    else e.currentTarget.blur();
  };

  const menuItems = [
    { label: 'Rename list', icon: Pencil, onSelect: () => setEditingName(true) },
    ...(collected > 0
      ? [{ label: 'Restart list', icon: RotateCcw, onSelect: () => actions.restartList(list.id) }]
      : []),
    { label: 'Delete list', icon: Trash2, danger: true, onSelect: () => actions.deleteList(list.id) },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0, scale: isActive ? 1 : 0.94 }}
      transition={cardTransition}
      className="glass flex h-full w-[var(--card-w)] shrink-0 snap-center flex-col rounded-[28px]"
    >
      <header className="px-5 pb-2 pt-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {editingName ? (
              <InlineEdit
                value={list.name}
                label="List name"
                className="px-3 py-1.5 text-xl font-semibold"
                onCommit={(name) => {
                  actions.renameList(list.id, name);
                  setEditingName(false);
                }}
                onCancel={() => setEditingName(false)}
              />
            ) : (
              <h2 className="truncate text-xl font-semibold tracking-tight">
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  aria-label={`Rename list ${list.name}`}
                  className="max-w-full truncate text-left"
                >
                  {list.name}
                </button>
              </h2>
            )}
          </div>
          <div className="-mr-2 -mt-1">
            <ActionMenu icon={Ellipsis} label={`Actions for ${list.name}`} items={menuItems} />
          </div>
        </div>

        {total > 0 && (
          <div
            role="progressbar"
            aria-label="Collected"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={collected}
            className="mt-3 h-1 overflow-hidden rounded-full bg-fg/10"
          >
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="h-full rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent)/0.6)]"
            />
          </div>
        )}
      </header>

      <div className="flex items-center gap-2 px-4 pb-1 pt-2">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/40"
          />
          <input
            ref={finderRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleFinderKey}
            placeholder="Search or add item"
            aria-label={`Search or add an item to ${list.name}`}
            enterKeyHint="search"
            autoComplete="off"
            className="field py-2.5 pl-10 pr-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery('');
                finderRef.current?.focus();
              }}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-fg/45 transition hover:text-fg"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {canAdd && (
            <motion.button
              type="button"
              key="add"
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ duration: 0.16 }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={addFromQuery}
              aria-label={`Add “${query.trim()}”`}
              className="flex h-[46px] shrink-0 items-center gap-1 overflow-hidden rounded-2xl bg-accent px-3.5 text-sm font-semibold text-accent-ink shadow-[0_0_18px_rgb(var(--accent)/0.35)] active:scale-95"
            >
              <Plus size={18} strokeWidth={2.75} />
              Add
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ul className="fade-y relative min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-5 pt-2 scrollbar-none">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              showQuantity={showQuantity}
              onToggle={() => handleToggle(item.id)}
              onRename={(name) => actions.renameItem(list.id, item.id, name)}
              onQuantity={(delta) => actions.changeQuantity(list.id, item.id, delta)}
              onDelete={() => actions.deleteItem(list.id, item.id)}
            />
          ))}
        </AnimatePresence>

        {total === 0 && (
          <li className="px-6 pt-10 text-center text-sm text-fg/45">
            Nothing here yet.
            <br />
            Type above to add your first item.
          </li>
        )}
        {total > 0 && visible.length === 0 && (
          <li className="px-6 pt-10 text-center text-sm text-fg/45">
            No match for “{query.trim()}”.
            <br />
            Press Enter to add it.
          </li>
        )}
      </ul>
    </motion.section>
  );
}
