type RealtimeTable = "favorites" | "binders" | "binder_cards";

const LOCAL_CHANGE_TTL_MS = 10_000;
const pendingChanges = new Map<string, number>();

function changeKey(table: RealtimeTable, userId: string, rowId: string) {
  return `${table}:${userId}:${rowId}`;
}

export function markLocalRealtimeChange(
  table: RealtimeTable,
  userId: string,
  rowIds: string[],
) {
  const now = Date.now();
  for (const [key, expiresAt] of pendingChanges) {
    if (expiresAt <= now) pendingChanges.delete(key);
  }
  for (const rowId of rowIds) {
    pendingChanges.set(changeKey(table, userId, rowId), now + LOCAL_CHANGE_TTL_MS);
  }
}

export function clearLocalRealtimeChange(
  table: RealtimeTable,
  userId: string,
  rowIds: string[],
) {
  for (const rowId of rowIds) {
    pendingChanges.delete(changeKey(table, userId, rowId));
  }
}

export function consumeLocalRealtimeChange(
  table: RealtimeTable,
  userId: string,
  rowId: string | undefined,
) {
  if (!rowId) return false;
  const key = changeKey(table, userId, rowId);
  const expiresAt = pendingChanges.get(key);
  pendingChanges.delete(key);
  return expiresAt !== undefined && expiresAt > Date.now();
}
