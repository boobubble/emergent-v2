import { createContext, useContext } from "react";

export type ChatroomShellPanelContextValue = {
  embedded: boolean;
  openPoetryCompose: () => void;
  closePoetryCompose: () => void;
};

export const ChatroomShellPanelContext = createContext<ChatroomShellPanelContextValue | null>(
  null,
);

export function useChatroomShellPanelContext() {
  return useContext(ChatroomShellPanelContext);
}
