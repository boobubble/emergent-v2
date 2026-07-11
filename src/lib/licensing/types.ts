/**
 * Unified License Manager — shared types.
 *
 * These types are safe to import from both client and server code.
 */

export type LicenseSourceId = "self" | "envato" | "codester" | (string & {});

/** Billing/entitlement plan attached to a license. */
export type LicensePlan = "trial" | "monthly" | "yearly" | "lifetime";

export const LICENSE_PLANS: LicensePlan[] = ["trial", "monthly", "yearly", "lifetime"];

export function isLifetimePlan(plan: LicensePlan | null | undefined): boolean {
  return plan === "lifetime";
}

/** Human-friendly expiry label — returns "Lifetime" for lifetime licenses. */
export function formatExpiry(
  plan: LicensePlan | null | undefined,
  expiryDate: string | null | undefined,
  locale?: string,
): string {
  if (isLifetimePlan(plan)) return "Lifetime";
  if (!expiryDate) return "—";
  try {
    return new Date(expiryDate).toLocaleDateString(locale);
  } catch {
    return String(expiryDate);
  }
}

export type LicenseStatus =
  | "active"
  | "suspended"
  | "revoked"
  | "expired"
  | "pending"
  | "disabled"
  | "development"
  | "localhost"
  | "unlimited";

export interface LicenseIdentity {
  /** Free-form license key (Self / Codester) or Envato purchase code. */
  key: string;
  /** Optional purchase code when it differs from the key (e.g. Envato). */
  purchaseCode?: string;
  /** Customer email — required for Self licenses. */
  customerEmail?: string;
}

export interface HostFingerprint {
  domain: string;
  serverIp?: string;
  installationId?: string;
  runtime?: string;
  productVersion?: string;
}

export interface LicenseVerificationResult {
  ok: boolean;
  status: LicenseStatus;
  sourceId: LicenseSourceId;
  license: {
    key: string;
    purchaseCode?: string;
    customerEmail?: string;
    customerName?: string;
    product?: string;
    productVersion?: string;
    activationDate?: string;
    expiryDate?: string | null;
    maxActivations?: number;
    plan?: LicensePlan;
    isLifetime?: boolean;
  };
  /** Provider-side raw response echoed for logging. Never contains secrets. */
  // Use `any` here so the TanStack serializer accepts pass-through JSON.
  raw?: any;
  /** Human-readable failure reason when `ok=false`. */
  message?: string;
}

export interface LicenseActivationRecord {
  id: string;
  licenseId: string;
  domain: string;
  serverIp: string | null;
  installationId: string | null;
  runtime: string | null;
  productVersion: string | null;
  active: boolean;
  activatedAt: string;
  deactivatedAt: string | null;
  lastSeenAt: string;
}

export interface LicenseRecord {
  id: string;
  licenseKey: string;
  purchaseCode: string | null;
  sourceId: LicenseSourceId;
  customerEmail: string | null;
  customerName: string | null;
  product: string;
  productVersion: string | null;
  activationDate: string | null;
  expiryDate: string | null;
  maxActivations: number;
  currentActivations: number;
  currentDomain: string | null;
  serverIp: string | null;
  installationId: string | null;
  lastValidationAt: string | null;
  lastValidationOk: boolean | null;
  status: LicenseStatus;
  notes: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/** Signed cache payload stored in app_settings.license_cache. */
export interface SignedLicenseCache {
  version: 1;
  issuedAt: string;
  status: LicenseStatus;
  sourceId: LicenseSourceId;
  licenseId: string;
  domain: string;
  serverIp?: string;
  productVersion?: string;
  expiryDate?: string;
  /** Grace period in seconds; runtime uses this when the network is down. */
  gracePeriodSeconds: number;
  /** HMAC-SHA256(payload, LICENSE_HMAC_SECRET) over the JSON-canonical payload. */
  signature: string;
}
