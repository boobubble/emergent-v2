/**
 * Shared helpers for service stubs.
 *
 * `notImplemented` is the placeholder body for every future-module
 * method. It throws at runtime so accidental wiring is loud, but the
 * type signature it satisfies matches the real interface so call
 * sites compile against the same contract.
 */

export class NotImplementedError extends Error {
  constructor(module: string, method: string) {
    super(`[${module}] ${method} is not implemented yet. Flip the feature flag in admin once the module is built.`);
    this.name = "NotImplementedError";
  }
}

export function notImplemented(module: string, method: string): never {
  throw new NotImplementedError(module, method);
}
