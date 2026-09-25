// crypto.randomUUID only exists in secure contexts (https / localhost), so a
// plain-http LAN deployment needs a fallback.
export const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
