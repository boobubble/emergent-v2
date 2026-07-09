// Optional AES-256-GCM backup encryption using a user password (PBKDF2).
// Output binary layout:
//   magic  "BBENC1" (6B) | salt (16B) | iv (12B) | ciphertext (...)
//
// The password is never stored; the salt+iv are packed so restore only needs
// the file + password to decrypt.

const MAGIC = new Uint8Array([0x42, 0x42, 0x45, 0x4e, 0x43, 0x31]); // "BBENC1"
const PBKDF_ITERS = 200_000;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: PBKDF_ITERS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBlobAes256(input: Blob, password: string): Promise<Blob> {
  const bytes = new Uint8Array(await input.arrayBuffer());
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    bytes as unknown as BufferSource,
  );
  const cipher = new Uint8Array(cipherBuf);
  const out = new Uint8Array(MAGIC.length + salt.length + iv.length + cipher.length);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC.length);
  out.set(iv, MAGIC.length + salt.length);
  out.set(cipher, MAGIC.length + salt.length + iv.length);
  return new Blob([out as unknown as BlobPart], { type: "application/octet-stream" });
}

export function isEncryptedBackup(bytes: Uint8Array): boolean {
  if (bytes.length < MAGIC.length) return false;
  for (let i = 0; i < MAGIC.length; i++) if (bytes[i] !== MAGIC[i]) return false;
  return true;
}

export async function decryptBackup(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  if (!isEncryptedBackup(bytes)) throw new Error("Not an encrypted backup");
  const salt = bytes.slice(MAGIC.length, MAGIC.length + 16);
  const iv = bytes.slice(MAGIC.length + 16, MAGIC.length + 16 + 12);
  const cipher = bytes.slice(MAGIC.length + 16 + 12);
  const key = await deriveKey(password, salt);
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
    return new Uint8Array(plain);
  } catch {
    throw new Error("Incorrect password or corrupted backup");
  }
}
