import { createContext } from "react";
import type { BuyerConversation, BuyerNotification } from "../../../api/services";
export interface CommunicationState { conversations: BuyerConversation[]; notifications: BuyerNotification[]; reload: () => void }
export const CommunicationContext = createContext<CommunicationState | null>(null);
