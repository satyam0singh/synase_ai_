// @ts-check
/* Safe-payload redaction and workflow event normalisation. */

export function redactMcpPayload(value) {
  const sensitive = /token|password|secret|authorization|api[_-]?key|credential/i;
  if (Array.isArray(value)) return value.map(redactMcpPayload);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sensitive.test(key) ? "[REDACTED]" : redactMcpPayload(nested)]));
  }
  return value;
}

export function normalizeWorkflowEvents(events) {
  const byId = new Map();
  for (const event of events) {
    if (!event?.eventId || !Number.isFinite(event.sequence)) continue;
    if (!byId.has(event.eventId)) byId.set(event.eventId, event);
  }
  return [...byId.values()].sort((a, b) => a.sequence - b.sequence);
}
