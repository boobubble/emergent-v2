function resolveApiBaseUrl(apiBaseUrl) {
  return (apiBaseUrl ?? "https://api.lovable.dev").replace(/\/$/, "");
}
var EmailAPIError = class extends Error {
  constructor(status, message, retryAfterSeconds, code = null) {
    super(message);
    this.name = "EmailAPIError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    this.code = code;
  }
  get retryable() {
    return this.status === 429 || this.status >= 500 && this.status < 600;
  }
};
function parseRetryAfter(header) {
  if (!header) return null;
  const parsed = Number(header);
  if (!Number.isNaN(parsed)) return parsed;
  const date = new Date(header);
  if (!Number.isNaN(date.getTime())) return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1e3));
  return null;
}
function buildAuthHeaderValue(apiKey) {
  return `Bearer ${apiKey}`;
}
function parseErrorCode(body) {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "type" in parsed && typeof parsed.type === "string") return parsed.type;
  } catch {
    return null;
  }
  return null;
}
async function throwIfNotOk(response) {
  if (response.ok) return;
  const errorText = await response.text();
  const safeErrorText = errorText.length > 500 ? `${errorText.slice(0, 500)}...` : errorText;
  const retryAfterSeconds = parseRetryAfter(response.headers.get("Retry-After"));
  const code = parseErrorCode(errorText);
  if (response.status === 429) console.error("[email-js] rate limited:", {
    status: response.status,
    code,
    retryAfterSeconds
  });
  throw new EmailAPIError(response.status, `Email API error: ${response.status} ${safeErrorText}`, retryAfterSeconds, code);
}
const DEFAULT_SEND_PATH = "/v1/messaging/email/send";
async function sendLovableEmail(payload, options) {
  const apiKey = options.apiKey;
  if (!apiKey) throw new Error("Missing Lovable API key");
  const authHeader = options.authHeader ?? "Authorization";
  const url = options.sendUrl || `${resolveApiBaseUrl(options.apiBaseUrl)}${DEFAULT_SEND_PATH}`;
  const idempotencyKey = options.idempotencyKey ?? payload.idempotency_key ?? payload.run_id;
  const headers = {
    [authHeader]: buildAuthHeaderValue(apiKey),
    "Content-Type": "application/json"
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  await throwIfNotOk(response);
  return await response.json();
}
export {
  sendLovableEmail as s
};
