import { useCallback, useEffect, useState } from 'react';
import { createId } from './ids.js';
import { loadState, saveState } from './storage.js';

const insertAt = (array, index, value) => {
  const next = [...array];
  next.splice(Math.min(index, next.length), 0, value);
  return next;
};

const mapList = (state, listId, fn) => ({
  ...state,
  lists: state.lists.map((list) => (list.id === listId ? fn(list) : list)),
});

const mapItem = (state, listId, itemId, fn) =>
  mapList(state, listId, (list) => ({
    ...list,
    items: list.items.map((item) => (item.id === itemId ? fn(item) : item)),
  }));

/**
 * Owns the persisted lists plus a single-slot toast. A toast carrying
 * `restore` (a pure `(state) => state`) is an undo offer for a destructive
 * action; it is applied to whatever the state looks like when Undo is tapped.
 */
export function useLists() {
  const [data, setData] = useState(loadState);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    saveState(data);
  }, [data]);

  const offerUndo = useCallback((message, restore) => {
    setToast({ id: createId(), message, restore });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const runUndo = useCallback(() => {
    if (!toast?.restore) return;
    setData(toast.restore);
    setToast(null);
  }, [toast]);

  const addList = useCallback(() => {
    const id = createId();
    setData((prev) => ({ ...prev, lists: [...prev.lists, { id, name: 'New List', items: [] }] }));
    return id;
  }, []);

  const renameList = useCallback((listId, name) => {
    setData((prev) => mapList(prev, listId, (list) => ({ ...list, name: name.trim() || 'Untitled' })));
  }, []);

  const deleteList = useCallback(
    (listId) => {
      const index = data.lists.findIndex((list) => list.id === listId);
      if (index === -1) return;
      const removed = data.lists[index];
      setData((prev) => ({ ...prev, lists: prev.lists.filter((list) => list.id !== listId) }));
      offerUndo(`Deleted “${removed.name}”`, (state) => ({
        ...state,
        lists: insertAt(state.lists, index, removed),
      }));
    },
    [data.lists, offerUndo],
  );

  // Marks every item as "to buy" again, ready for the next shopping trip.
  const restartList = useCallback(
    (listId) => {
      const list = data.lists.find((l) => l.id === listId);
      if (!list) return;
      const previous = new Map(list.items.map((item) => [item.id, item.checked]));
      setData((prev) =>
        mapList(prev, listId, (l) => ({
          ...l,
          items: l.items.map((item) => ({ ...item, checked: true })),
        })),
      );
      offerUndo(`Restarted “${list.name}”`, (state) =>
        mapList(state, listId, (l) => ({
          ...l,
          items: l.items.map((item) => ({ ...item, checked: previous.get(item.id) ?? item.checked })),
        })),
      );
    },
    [data.lists, offerUndo],
  );

  const addItem = useCallback((listId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const item = { id: createId(), name: trimmed, checked: true, quantity: 1 };
    setData((prev) => mapList(prev, listId, (list) => ({ ...list, items: [...list.items, item] })));
  }, []);

  const renameItem = useCallback((listId, itemId, name) => {
    setData((prev) =>
      mapItem(prev, listId, itemId, (item) => ({ ...item, name: name.trim() || item.name })),
    );
  }, []);

  const toggleItem = useCallback((listId, itemId) => {
    setData((prev) => mapItem(prev, listId, itemId, (item) => ({ ...item, checked: !item.checked })));
  }, []);

  const changeQuantity = useCallback((listId, itemId, delta) => {
    setData((prev) =>
      mapItem(prev, listId, itemId, (item) => ({ ...item, quantity: Math.max(1, item.quantity + delta) })),
    );
  }, []);

  const deleteItem = useCallback(
    (listId, itemId) => {
      const list = data.lists.find((l) => l.id === listId);
      const index = list?.items.findIndex((item) => item.id === itemId) ?? -1;
      if (index === -1) return;
      const removed = list.items[index];
      setData((prev) =>
        mapList(prev, listId, (l) => ({ ...l, items: l.items.filter((item) => item.id !== itemId) })),
      );
      offerUndo(`Removed “${removed.name}”`, (state) =>
        state.lists.some((l) => l.id === listId)
          ? mapList(state, listId, (l) => ({ ...l, items: insertAt(l.items, index, removed) }))
          : state,
      );
    },
    [data.lists, offerUndo],
  );

  return {
    data,
    toast,
    dismissToast,
    runUndo,
    addList,
    renameList,
    deleteList,
    restartList,
    addItem,
    renameItem,
    toggleItem,
    changeQuantity,
    deleteItem,
  };
}
