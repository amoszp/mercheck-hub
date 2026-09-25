import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

/**
 * Floating list navigator: previous / one dot per list (+ a "new list" dot) / next.
 * Index `lists.length` is the "new list" card.
 */
export default function Dock({ lists, activeIndex, onSelect }) {
  const lastIndex = lists.length;

  return (
    <nav aria-label="Lists" className="glass flex max-w-full items-center gap-0.5 rounded-full p-1.5">
      <button
        type="button"
        aria-label="Previous list"
        disabled={activeIndex <= 0}
        onClick={() => onSelect(activeIndex - 1)}
        className="glass-btn h-9 w-9 disabled:opacity-25"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex min-w-0 items-center overflow-x-auto scrollbar-none">
        {lists.map((list, index) => (
          <button
            key={list.id}
            type="button"
            aria-label={list.name}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => onSelect(index)}
            className="flex h-9 shrink-0 items-center px-1"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-accent' : 'w-2 bg-fg/30'
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          aria-label="New list"
          aria-current={activeIndex === lastIndex ? 'true' : undefined}
          onClick={() => onSelect(lastIndex)}
          className={`flex h-9 w-7 shrink-0 items-center justify-center transition ${
            activeIndex === lastIndex ? 'text-accent-text' : 'text-fg/40'
          }`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Next list"
        disabled={activeIndex >= lastIndex}
        onClick={() => onSelect(activeIndex + 1)}
        className="glass-btn h-9 w-9 disabled:opacity-25"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}
