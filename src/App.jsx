import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'mercheck-hub-data';

const createId = () => crypto.randomUUID();

const defaultList = (name = 'New List') => ({
  id: createId(),
  name,
  items: [],
});

const defaultState = () => ({
  lists: [defaultList('Groceries')],
});

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed?.lists?.length) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
};

function App() {
  const [data, setData] = useState(loadState);
  const [finders, setFinders] = useState({});
  const [editingListId, setEditingListId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const finderRefs = useRef({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const totalCards = data.lists.length + 1;

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    let closest = 0;
    let minDist = Infinity;
    const center = scrollLeft + el.clientWidth / 2;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setScrollIndex(closest);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [data.lists.length, updateScrollState]);

  const scrollToCard = (index) => {
    const card = cardRefs.current[index];
    if (!card || !carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: card.offsetLeft - (carouselRef.current.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
  };

  const scrollPrev = () => scrollToCard(Math.max(0, scrollIndex - 1));
  const scrollNext = () => scrollToCard(Math.min(totalCards - 1, scrollIndex + 1));

  const updateList = (listId, updater) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, ...updater(list) } : list,
      ),
    }));
  };

  const addList = () => {
    setData((prev) => {
      const nextLength = prev.lists.length + 1;
      setTimeout(() => scrollToCard(nextLength - 1), 80);
      return {
        ...prev,
        lists: [...prev.lists, defaultList()],
      };
    });
  };

  const deleteList = (listId) => {
    if (!confirm('Delete this list?')) return;
    setData((prev) => {
      const lists = prev.lists.filter((l) => l.id !== listId);
      return { lists: lists.length ? lists : [defaultList()] };
    });
    setFinders((prev) => {
      const next = { ...prev };
      delete next[listId];
      return next;
    });
  };

  const renameList = (listId, name) => {
    updateList(listId, () => ({ name: name.trim() || 'Untitled' }));
    setEditingListId(null);
  };

  const addItem = (listId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateList(listId, (list) => ({
      items: [...list.items, { id: createId(), name: trimmed, checked: false, quantity: 1 }],
    }));
    setFinders((prev) => ({ ...prev, [listId]: '' }));
    requestAnimationFrame(() => finderRefs.current[listId]?.focus());
  };

  const renameItem = (listId, itemId, name) => {
    updateList(listId, (list) => ({
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, name: name.trim() || 'Item' } : item,
      ),
    }));
    setEditingItemId(null);
  };

  const toggleItem = (listId, itemId) => {
    updateList(listId, (list) => ({
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  const changeQuantity = (listId, itemId, delta) => {
    updateList(listId, (list) => ({
      items: list.items.map((item) => {
        if (item.id !== itemId) return item;
        const next = Math.max(1, item.quantity + delta);
        return { ...item, quantity: next };
      }),
    }));
  };

  const sortItems = (items) => {
    const needed = items.filter((i) => i.checked);
    const collected = items.filter((i) => !i.checked);
    return [...needed, ...collected];
  };

  const filterItems = (items, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  };

  const queryMatchesExisting = (list, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return list.items.some((item) => item.name.toLowerCase().includes(q));
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-center text-2xl font-bold tracking-wide text-[#9e8123]">
          Mercheck Hub
        </h1>
      </header>

      <div className="relative flex-1">
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous list"
            className="fixed left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-accent shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next list"
            className="fixed right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-accent shadow-lg backdrop-blur-sm"
          >
            <ChevronRight size={22} />
          </button>
        )}

        <div
          ref={carouselRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
        >
          {data.lists.map((list, listIndex) => {
            const finderQuery = finders[list.id] ?? '';
            const sorted = sortItems(list.items);
            const visible = filterItems(sorted, finderQuery);
            const showQuickAdd =
              finderQuery.trim().length > 0 && !queryMatchesExisting(list, finderQuery);

            return (
              <motion.section
                key={list.id}
                ref={(el) => {
                  cardRefs.current[listIndex] = el;
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mx-4 w-[85vw] shrink-0 snap-center rounded-2xl bg-card shadow-[0px_15px_30px_rgba(0,0,0,1.0)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-muted/40 px-4 py-3">
                  {editingListId === list.id ? (
                    <input
                      autoFocus
                      defaultValue={list.name}
                      onBlur={(e) => renameList(list.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameList(list.id, e.currentTarget.value);
                        if (e.key === 'Escape') setEditingListId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 rounded-lg bg-background/60 px-2 py-1 text-lg font-semibold text-white outline-none ring-1 ring-accent/50"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingListId(list.id)}
                      className="min-w-0 flex-1 truncate text-left text-lg font-semibold text-white"
                    >
                      {list.name}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteList(list.id)}
                    aria-label="Delete list"
                    className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-background/40 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    ref={(el) => {
                      finderRefs.current[list.id] = el;
                    }}
                    type="text"
                    value={finderQuery}
                    onChange={(e) =>
                      setFinders((prev) => ({ ...prev, [list.id]: e.target.value }))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0 flex-1 rounded-xl bg-background/60 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-muted/50 focus:ring-accent/60"
                  />
                  {showQuickAdd && (
                    <button
                      type="button"
                      onClick={() => addItem(list.id, finderQuery)}
                      aria-label="Quick add item"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-background"
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                <ul className="max-h-[55dvh] space-y-1 overflow-y-auto px-3 pb-4 scrollbar-none">
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        opacity: item.checked ? 1 : 0.65,
                        backgroundColor: item.checked
                          ? 'rgba(158, 129, 35, 0.15)'
                          : 'transparent',
                      }}
                      className="flex items-center gap-2 rounded-xl px-2 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(list.id, item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 shrink-0 cursor-pointer accent-accent"
                      />

                      {editingItemId === item.id ? (
                        <input
                          autoFocus
                          defaultValue={item.name}
                          onBlur={(e) => renameItem(list.id, item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              renameItem(list.id, item.id, e.currentTarget.value);
                            if (e.key === 'Escape') setEditingItemId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-0 flex-1 rounded-lg bg-background/60 px-2 py-1 text-sm text-white outline-none ring-1 ring-accent/50"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingItemId(item.id)}
                          className="min-w-0 flex-1 truncate text-left text-sm text-white"
                        >
                          {item.name}
                        </button>
                      )}

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeQuantity(list.id, item.id, -1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/50 text-accent"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums text-white/80">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeQuantity(list.id, item.id, 1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/50 text-accent"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.section>
            );
          })}

          <motion.button
            type="button"
            ref={(el) => {
              cardRefs.current[data.lists.length] = el;
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={addList}
            className="mx-4 flex w-[85vw] shrink-0 snap-center flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted/60 bg-card/50 shadow-[0px_15px_30px_rgba(0,0,0,1.0)] min-h-[280px]"
          >
            <Plus size={36} className="mb-2 text-accent" strokeWidth={1.5} />
            <span className="text-sm font-medium text-white/70">Add New List</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
