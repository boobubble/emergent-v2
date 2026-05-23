// Pure username validation rules shared by client UI, server fn, and DB trigger.
// Rules:
//   - Trimmed length 1..32
//   - Only letters, numbers, spaces, underscores
//   - Letter count must be between 2 and 10
//   - "guest-" prefix is reserved (rejected here; DB trigger allows it only for anon users)

export type UsernameValidation =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function validateUsername(raw: unknown): UsernameValidation {
  if (typeof raw !== "string") return { ok: false, reason: "Username is required." };
  const v = raw.trim();
  if (v.length === 0) return { ok: false, reason: "Username cannot be empty." };
  if (v.length > 32) return { ok: false, reason: "Username must be 32 characters or fewer." };
  if (/^guest-/i.test(v)) return { ok: false, reason: "Reserved prefix." };
  if (!/^[a-zA-Z0-9_ ]+$/.test(v)) {
    return { ok: false, reason: "Only letters, numbers, spaces and _ allowed." };
  }
  const letters = v.replace(/[^a-zA-Z]/g, "").length;
  if (letters < 2 || letters > 10) {
    return { ok: false, reason: "Username must contain 2 to 10 letters." };
  }
  return { ok: true, value: v };
}
