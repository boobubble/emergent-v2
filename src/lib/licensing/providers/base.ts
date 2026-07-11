/**
 * Provider interface for the unified License Manager.
 *
 * Adding a new marketplace (Gumroad, Paddle, LemonSqueezy, Sellix,
 * WooCommerce, Shopify, custom, …) is purely additive: implement this
 * interface in a new file and register the class in
 * `manager.server.ts`. No core changes required.
 */
import type {
  HostFingerprint,
  LicenseIdentity,
  LicenseSourceId,
  LicenseVerificationResult,
} from "../types";

export interface LicenseProvider {
  /** Stable id, matches `license_sources.id`. */
  readonly sourceId: LicenseSourceId;

  /** Human label. */
  readonly label: string;

  /**
   * Verify the identity/key with the marketplace or self-server. Must
   * NOT touch the local `licenses` table — the manager persists the
   * result. Returns `ok=false` with a message on any failure.
   */
  verify(identity: LicenseIdentity, host: HostFingerprint): Promise<LicenseVerificationResult>;
}

/** Common Envato-style purchase-code regex. */
export const ENVATO_PURCHASE_CODE_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** BooBubble offline / Self license format. */
export const SELF_LICENSE_KEY_RE = /^BOOB(-[A-Z0-9]{4}){4}$/i;

/** Codester purchase code (loose format — 12+ alnum). */
export const CODESTER_PURCHASE_CODE_RE = /^[A-Za-z0-9-]{10,64}$/;
