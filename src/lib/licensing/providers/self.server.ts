/**
 * Self Website license provider.
 *
 * Calls the customer-hosted license server at `LICENSE_SERVER_URL`,
 * signing the outbound payload with `LICENSE_SERVER_HMAC_SECRET` so the
 * server can trust the request. Falls back to a permissive local check
 * when `LICENSE_SERVER_URL` is a placeholder ("yourdomain") — this lets
 * the installer boot before the vendor licensing infra is wired up
 * while still enforcing the key format.
 */
import { signHmac } from "../crypto.server";
import type {
  HostFingerprint,
  LicenseIdentity,
  LicenseVerificationResult,
} from "../types";
import { SELF_LICENSE_KEY_RE, type LicenseProvider } from "./base";

function isPlaceholderUrl(url: string): boolean {
  return !url || url.includes("yourdomain") || url === "https://licenses.yourdomain.com";
}

export class SelfLicenseProvider implements LicenseProvider {
  readonly sourceId = "self" as const;
  readonly label = "Self Website";

  async verify(identity: LicenseIdentity, host: HostFingerprint): Promise<LicenseVerificationResult> {
    const key = identity.key?.trim();
    const email = identity.customerEmail?.trim();
    if (!key || !SELF_LICENSE_KEY_RE.test(key)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: key ?? "" },
        message: "License key format must look like BOOB-XXXX-XXXX-XXXX-XXXX.",
      };
    }
    if (!email) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key },
        message: "Customer email is required for a Self Website license.",
      };
    }

    const url = process.env.LICENSE_SERVER_URL ?? "";
    if (isPlaceholderUrl(url) || !process.env.LICENSE_SERVER_HMAC_SECRET || process.env.LICENSE_SERVER_HMAC_SECRET === "CHANGE_ME_LATER") {
      // No real license server wired yet — accept locally so setup can proceed.
      return {
        ok: true,
        status: "active",
        sourceId: this.sourceId,
        license: {
          key,
          customerEmail: email,
          product: "boobubble",
          productVersion: host.productVersion,
          activationDate: new Date().toISOString(),
          maxActivations: 1,
        },
        message: "Verified locally (LICENSE_SERVER_URL not configured).",
      };
    }

    const payload = {
      key,
      email,
      domain: host.domain,
      server_ip: host.serverIp ?? null,
      installation_id: host.installationId ?? null,
      product: "boobubble",
      product_version: host.productVersion ?? null,
      issued_at: new Date().toISOString(),
    };
    const signature = signHmac(payload, "LICENSE_SERVER_HMAC_SECRET");

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(new URL("/api/license/verify", url).toString(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-license-signature": signature,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(t);
      const body: any = await r.json().catch(() => ({}));
      if (!r.ok || body?.ok !== true) {
        return {
          ok: false,
          status: (body?.status as any) ?? "pending",
          sourceId: this.sourceId,
          license: { key, customerEmail: email },
          message: body?.message ?? `Self server returned ${r.status}`,
          raw: body,
        };
      }
      return {
        ok: true,
        status: (body?.status as any) ?? "active",
        sourceId: this.sourceId,
        license: {
          key,
          customerEmail: email,
          customerName: body?.customer_name,
          product: body?.product ?? "boobubble",
          productVersion: body?.product_version ?? host.productVersion,
          activationDate: body?.activation_date,
          expiryDate: body?.expiry_date,
          maxActivations: body?.max_activations ?? 1,
        },
        raw: body,
      };
    } catch (e: any) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key, customerEmail: email },
        message: `Self server unreachable: ${e?.message ?? "unknown error"}`,
      };
    }
  }
}
