import { useEffect, useState } from "react";
import { useAuthedTwilio } from "../context/TwilioProvider";
import { Filters, PaginationState } from "../services/contacts.service";
import { ChatInfo } from "../types";
import { fetchChatsHelper } from "../components/Messages/ChatsPane";

export function useInitialChatsFetch(
    filters: Filters,
    onUpdateChats: (chats: ChatInfo[]) => void,
    setPaginationState: (paginationState: PaginationState | undefined) => void,
  ) {
    const { twilioClient } = useAuthedTwilio();
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      const loadSingleChat = async () => {
        const chat = await twilioClient.getChat(
          filters.activeNumber,
          filters.search ?? "",
        );
        if (chat && filters.onlyUnread) {
          const [isUnread] = await twilioClient.hasUnread(filters.activeNumber, [chat]);
          // Apply unread status
          onUpdateChats(chat && isUnread ? [{ ...chat, hasUnread: true }] : []);
        } else {
          onUpdateChats(chat ? [chat] : []);
        }
      };

      const loadChats = async () => {
        if (!twilioClient || !filters.activeNumber) return;
  
        setIsLoading(true);
        if (filters.search) {
          await loadSingleChat();
          setIsLoading(false);
          return;
        }
  
        const newChats = await fetchChatsHelper(
          twilioClient,
          [],
          undefined,
          filters,
        );
        setPaginationState(newChats.paginationState);
        onUpdateChats(newChats.chats);
        setIsLoading(false);
      };
  
      loadChats();
    }, [twilioClient, filters]);

    return { isLoading };
  }