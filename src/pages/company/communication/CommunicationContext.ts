import { createContext, useContext } from "react";
import type { Conversation, CompanyNotification } from "./communicationTypes";

export interface CommunicationState {
  conversations: Conversation[]; drafts: Record<string, string>;
  setDraft: (id: string, text: string) => void; openConversation: (id: string) => void;
  sendMessage: (id: string) => Promise<boolean>;
  chatLoading: boolean; chatFailure: string; threadLoading: boolean; threadFailure: string;
  chatConnected: boolean; sending: boolean; sendError: string; reloadChat: () => void;
  notifications: CompanyNotification[]; loading: boolean; failure: string; needsLogin: boolean;
  actionError: string; busy: string | null; reload: () => void;
  markRead: (id: string) => Promise<boolean>; markAllRead: () => Promise<void>;
}
export const CommunicationContext = createContext<CommunicationState | null>(null);
export function useCommunication() {
  const state = useContext(CommunicationContext);
  if (!state) throw new Error("Communication provider missing");
  return state;
}
