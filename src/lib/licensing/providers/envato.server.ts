/**
 * CodeCanyon (Envato) license provider.
 *
 * Verifies an Envato purchase code with the official Envato Author API
 * using ENVATO_PERSONAL_TOKEN. Docs:
 *   https://api.envato.com/v3/market/author/sale?code=<purchase_code>
 */
import type {
  HostFingerprint,
  LicenseIdentity,
  LicenseVerificationResult,
} from "../types";
import { ENVATO_PURCHASE_CODE_RE, type LicenseProvider } from "./base";

export class EnvatoLicenseProvider implements LicenseProvider {
  readonly sourceId = "envato" as const;
  readonly label = "CodeCanyon (Envato)";

  async verify(identity: LicenseIdentity, host: HostFingerprint): Promise<LicenseVerificationResult> {
    const code = (identity.purchaseCode ?? identity.key)?.trim();
    if (!code || !ENVATO_PURCHASE_CODE_RE.test(code)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code ?? "" },
        message: "Envato purchase code must be a UUID-shaped hex string.",
      };
    }

    const token = process.env.ENVATO_PERSONAL_TOKEN;
    if (!token || token === "ADD_LATER") {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: "ENVATO_PERSONAL_TOKEN is not configured — add it in Backend > Secrets.",
      };
    }

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(
        `https://api.envato.com/v3/market/author/sale?code=${encodeURIComponent(code)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "BooBubble License Manager",
          },
          signal: controller.signal,
        },
      );
      clearTimeout(t);
      if (r.status === 404) {
        return {
          ok: false,
          status: "revoked",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: "Envato does not recognize this purchase code.",
        };
      }
      const body: any = await r.json().catch(() => ({}));
      if (!r.ok) {
        return {
          ok: false,
          status: "pending",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: body?.description ?? `Envato returned ${r.status}`,
          raw: body,
        };
      }
      return {
        ok: true,
        status: "active",
        sourceId: this.sourceId,
        license: {
          key: code,
          purchaseCode: code,
          customerName: body?.buyer,
          product: body?.item?.name ?? "boobubble",
          productVersion: host.productVersion,
          activationDate: body?.sold_at,
          // Envato "Extended License" grants lifetime updates; otherwise support may lapse but the license itself remains valid.
          expiryDate: body?.license === "Extended License" ? null : (body?.supported_until ?? undefined),
          maxActivations: body?.license === "Extended License" ? 1 : 1,
          plan: body?.license === "Extended License" ? "lifetime" : undefined,
        },
        raw: {
          buyer: body?.buyer,
          license: body?.license,
          item_id: body?.item?.id,
          sold_at: body?.sold_at,
          supported_until: body?.supported_until,
        },
      };
    } catch (e: any) {
      // Host is unused in this provider (Envato has no domain lock at verify time),
      // but keep the parameter to satisfy the interface for future use.
      void host;
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: `Envato API unreachable: ${e?.message ?? "unknown error"}`,
      };
    }
  }
}
