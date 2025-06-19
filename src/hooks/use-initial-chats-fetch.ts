import { useEffect } from "react";
import { useAuthedTwilio } from "../context/TwilioProvider";
import { Filters, PaginationState } from "../services/contacts.service";
import { ChatInfo } from "../types";
import { fetchChatsHelper } from "../components/Messages/ChatsPane";

export function useInitialChatsFetch(
    activePhoneNumber: string,
    filters: Filters,
    onUpdateChats: (chats: ChatInfo[]) => void,
    setPaginationState: (paginationState: PaginationState | undefined) => void,
  ) {
    const { twilioClient } = useAuthedTwilio();
  
    useEffect(() => {
      const loadChats = async () => {
        if (!twilioClient || !activePhoneNumber) return;
  
        if (filters.search) {
          const chat = await twilioClient.getChat(
            activePhoneNumber,
            filters.search,
          );
          if (chat && filters.onlyUnread) {
            const [isUnread] = await twilioClient.hasUnread(activePhoneNumber, [chat]);
            // Apply unread status
            onUpdateChats(chat && isUnread ? [{ ...chat, hasUnread: true }] : []);
          } else {
            onUpdateChats(chat ? [chat] : []);
          }
          return;
        }
  
        const newChats = await fetchChatsHelper(
          twilioClient,
          activePhoneNumber,
          [],
          undefined,
          filters,
        );
        setPaginationState(newChats.paginationState);
        onUpdateChats(newChats.chats);
      };
  
      loadChats();
    }, [twilioClient, activePhoneNumber, filters]);
  }