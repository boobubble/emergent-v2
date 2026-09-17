import type { IrcChatCore } from "./store";

export type ReconcileIrcCoreResult = {
  core: IrcChatCore | null;
  identityKey: string | null;
  created: boolean;
  destroyed: boolean;
};

/**
 * Pure lifecycle step used by IrcChatRuntimeProvider: keep one core per identity key.
 */
export function reconcileIrcCore(args: {
  nextIdentityKey: string | null;
  prevIdentityKey: string | null;
  existingCore: IrcChatCore | null;
  createCore: () => IrcChatCore | null;
  destroyCore: (core: IrcChatCore) => void;
}): ReconcileIrcCoreResult {
  const { nextIdentityKey, prevIdentityKey, existingCore, createCore, destroyCore } = args;

  if (!nextIdentityKey) {
    let destroyed = false;
    if (existingCore) {
      destroyCore(existingCore);
      destroyed = true;
    }
    return { core: null, identityKey: null, created: false, destroyed };
  }

  if (prevIdentityKey === nextIdentityKey && existingCore) {
    return {
      core: existingCore,
      identityKey: nextIdentityKey,
      created: false,
      destroyed: false,
    };
  }

  let destroyed = false;
  if (existingCore) {
    destroyCore(existingCore);
    destroyed = true;
  }

  const core = createCore();
  if (!core) {
    return { core: null, identityKey: null, created: false, destroyed };
  }

  return {
    core,
    identityKey: nextIdentityKey,
    created: true,
    destroyed,
  };
}
