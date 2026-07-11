/**
 * Codester license provider.
 *
 * Codester's public verification endpoint (as of 2025) is documented at
 * https://www.codester.com/api. When a `CODESTER_API_KEY` is
 * configured we POST the purchase code and read the JSON response.
 * When the key is a placeholder we fail closed with a clear message
 * so the installer prompts the operator to configure it.
 */
import type {
  HostFingerprint,
  LicenseIdentity,
  LicenseVerificationResult,
} from "../types";
import { CODESTER_PURCHASE_CODE_RE, type LicenseProvider } from "./base";

const CODESTER_VERIFY_URL = "https://www.codester.com/api/v1/verify-purchase";

export class CodesterLicenseProvider implements LicenseProvider {
  readonly sourceId = "codester" as const;
  readonly label = "Codester";

  async verify(identity: LicenseIdentity, host: HostFingerprint): Promise<LicenseVerificationResult> {
    const code = (identity.purchaseCode ?? identity.key)?.trim();
    if (!code || !CODESTER_PURCHASE_CODE_RE.test(code)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code ?? "" },
        message: "Codester purchase code format is invalid.",
      };
    }
    const apiKey = process.env.CODESTER_API_KEY;
    if (!apiKey || apiKey === "ADD_LATER") {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: "CODESTER_API_KEY is not configured — add it in Backend > Secrets.",
      };
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(CODESTER_VERIFY_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "BooBubble License Manager",
        },
        body: JSON.stringify({ purchase_code: code, domain: host.domain }),
        signal: controller.signal,
      });
      clearTimeout(t);
      const body: any = await r.json().catch(() => ({}));
      if (!r.ok || body?.valid === false || body?.ok === false) {
        return {
          ok: false,
          status: r.status === 404 ? "revoked" : "pending",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: body?.message ?? `Codester returned ${r.status}`,
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
          customerEmail: body?.buyer_email,
          customerName: body?.buyer,
          product: body?.item?.name ?? "boobubble",
          productVersion: host.productVersion,
          activationDate: body?.purchased_at,
          expiryDate: body?.supported_until ?? undefined,
          maxActivations: 1,
        },
        raw: body,
      };
    } catch (e: any) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: `Codester API unreachable: ${e?.message ?? "unknown error"}`,
      };
    }
  }
}
