/** Opens the DM for a Watch Together invite — registered by chat-store. */

let openDmForWatchInvite: ((peerId: string) => void) | null = null;

export function registerWatchTogetherDmOpener(fn: (peerId: string) => void): () => void {
  openDmForWatchInvite = fn;
  return () => {
    if (openDmForWatchInvite === fn) openDmForWatchInvite = null;
  };
}

export function ensureWatchTogetherDmOpen(peerId: string): void {
  openDmForWatchInvite?.(peerId);
}
