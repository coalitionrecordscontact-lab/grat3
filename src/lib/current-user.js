import { base44 } from "@/api/base44Client";

// auth.me() can return custom fields (username, affirmations, timezone)
// nested inside a `data` object. Normalize them to the top level so the
// rest of the app can always read currentUser.username, etc.
export function normalizeUser(me) {
  if (!me) return me;
  return me.data && typeof me.data === "object" ? { ...me.data, ...me } : me;
}

export async function fetchCurrentUser() {
  const me = await base44.auth.me();
  return normalizeUser(me);
}