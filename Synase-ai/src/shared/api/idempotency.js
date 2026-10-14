// @ts-check
/* Idempotency key factory shared by all mutating domain calls. */

export const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.() ?? `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
