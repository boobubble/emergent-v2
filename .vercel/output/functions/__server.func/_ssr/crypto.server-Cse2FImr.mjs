import { createHmac } from "node:crypto";
function requireSecret(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const obj = value;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(",")}}`;
}
function signHmac(payload, secretEnv = "LICENSE_HMAC_SECRET") {
  const secret = requireSecret(secretEnv);
  return createHmac("sha256", secret).update(canonicalize(payload)).digest("hex");
}
export {
  canonicalize as c,
  signHmac as s
};
