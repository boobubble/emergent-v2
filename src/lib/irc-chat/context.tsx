import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { IrcChatCore } from "./store";
import type { IrcChatState } from "./types";

export const IrcChatCoreContext = createContext<IrcChatCore | null>(null);

/** Thin provider for Phase B wiring — not used by /chatroom in Phase A. */
export function IrcChatCoreProvider({
  core,
  children,
}: {
  core: IrcChatCore;
  children: ReactNode;
}) {
  return (
    <IrcChatCoreContext.Provider value={core}>{children}</IrcChatCoreContext.Provider>
  );
}

export function useOptionalIrcChatCore(): IrcChatCore | null {
  return useContext(IrcChatCoreContext);
}

export function useIrcChatCore(): IrcChatCore {
  const core = useContext(IrcChatCoreContext);
  if (!core) {
    throw new Error("useIrcChatCore requires IrcChatCoreProvider");
  }
  return core;
}

export function useIrcChatState(): IrcChatState {
  const core = useIrcChatCore();
  return useSyncExternalStore(
    (onStoreChange) => core.subscribe(onStoreChange),
    () => core.getState(),
    () => core.getState(),
  );
}
