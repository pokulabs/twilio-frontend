import * as React from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedTwilio } from "../../context/TwilioProvider";
import { makeChatId } from "../../utils";
import withAuth from "../../context/withAuth";
import { apiClient } from "../../api-client";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import TwilioClient from "../../twilio-client";
import { useEffect, useState } from "react";
import type { Filters, PaginationState } from "../../services/contacts.service";


function useInitialChatsFetch(
  activePhoneNumber: string,
  filters: Filters,
  setChats: (chats: ChatInfo[]) => void,
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
          setChats(chat && isUnread ? [{ ...chat, hasUnread: true }] : []);
        } else {
          setChats(chat ? [chat] : []);
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
      setChats(newChats.chats);
    };

    loadChats();
  }, [twilioClient, activePhoneNumber, filters]);
}

function MessagesLayout(props: {
  chats: ChatInfo[];
  setChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  activePhoneNumber: string;
}) {
  const { chats, setChats, activePhoneNumber } = props;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [paginationState, setPaginationState] = useState<PaginationState | undefined>(undefined);
  const { twilioClient } = useAuthedTwilio();

  const selectedChat = React.useMemo(
    () => chats.find((c) => c.chatId === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  useInitialChatsFetch(activePhoneNumber, filters, setChats, setPaginationState);

  return (
    <Sheet
      id="messages-component"
      sx={{
        flex: 1,
        width: "100%",
        mx: "auto",
        pt: { xs: "var(--Header-height)", md: 0 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "minmax(min-content, min(30%, 400px)) 1fr",
        },
      }}
    >
      <Sheet
        sx={{
          position: { xs: "fixed", sm: "sticky" },
          transform: {
            xs: "translateX(calc(-100% * (var(--MessagesPane-slideIn, 0))))",
            sm: "none",
          },
          transition: "transform 0.4s, width 0.4s",
          zIndex: 100,
          width: "100%",
          top: 52,
          height: { xs: "calc(100dvh - 52px)", sm: "100dvh" }, // Need this line
          overflow: "hidden", // block parent scrolling
        }}
      >
        <ChatsPane
          activePhoneNumber={activePhoneNumber}
          chats={chats}
          paginationState={paginationState}
          selectedChatId={selectedChatId}
          onMessageFilterChange={(filters) => {
            setFilters(prev => {
              return { ...prev, onlyUnread: filters.onlyUnread }
            });
          }}
          onSearchFilterChange={(contactNumber) => {
            setFilters(prev => {
              return { ...prev, search: contactNumber ?? undefined }
            });
          }}
          onLoadMore={async () => {
            const newChats = await fetchChatsHelper(
              twilioClient,
              activePhoneNumber,
              chats,
              paginationState,
              filters,
            );
            setPaginationState(newChats.paginationState);
            setChats((prevChats) => {
              const chatMap = new Map<string, ChatInfo>();
              prevChats.forEach((chat) => chatMap.set(chat.chatId, chat));
              newChats.chats.forEach((chat) => {
                if (!chatMap.has(chat.chatId)) {
                  chatMap.set(chat.chatId, chat);
                }
              });
              return Array.from(chatMap.values());
            });
          }}
          setSelectedChat={(chat) => {
            setSelectedChatId(chat?.chatId ?? null);
            if (chat) {
              setChats((prevChats) =>
                prevChats.map((c) =>
                  c.chatId === chat.chatId ? { ...c, hasUnread: false } : c,
                ),
              );
            }
          }}
        />
      </Sheet>
      {selectedChat ? (
        <MessagesPane
          chat={selectedChat}
          activePhoneNumber={activePhoneNumber}
        />
      ) : (
        <NewMessagesPane
          callback={async (contactNumber: string) => {
            const newChats = await fetchChatsHelper(
              twilioClient,
              activePhoneNumber,
              chats,
              undefined,
              filters,
            );
            setPaginationState(newChats.paginationState);
            setChats(newChats.chats);
            const chat = newChats.chats.find(
              (e) => e.contactNumber === contactNumber,
            );
            if (chat) {
              setSelectedChatId(chat.chatId);
            }
            // TODO can reduce this to just
            // setSelectedChatId(`${activePhoneNumber}${contactNumber}`);
          }}
          activePhoneNumber={activePhoneNumber}
        />
      )}
    </Sheet>
  );
}

function useNewMessageListener(
  activePhoneNumber: string,
  setChats: (
    updater: ((prevChats: ChatInfo[]) => ChatInfo[]) | ChatInfo[],
  ) => void,
) {
  const { eventEmitter } = useAuthedTwilio();

  useEffect(() => {
    const subId = eventEmitter.on("new-message", async (msg) => {
      if (
        (msg.direction === "inbound" ? msg.to : msg.from) !== activePhoneNumber
      )
        return;
      const contactNumber = msg.direction === "inbound" ? msg.from : msg.to;
      const chatId = makeChatId(activePhoneNumber, contactNumber);

      const newChat: ChatInfo = {
        chatId,
        contactNumber,
        recentMsgContent: msg.content,
        recentMsgDate: new Date(msg.timestamp),
        recentMsgId: msg.id,
        recentMsgDirection: msg.direction,
      };

      try {
        const flagged = await apiClient.getFlaggedChats();
        const match = flagged.data.data.find((e) => e.chatCode === chatId);
        if (match) {
          Object.assign(newChat, match);
        }
      } catch {}

      setChats((prev) => {
        const index = prev.findIndex((c) => c.chatId === chatId);
        if (index >= 0) {
          const updated = [...prev];
          newChat.hasUnread =
            msg.direction === "inbound" ? true : updated[index].hasUnread;
          updated[index] = { ...updated[index], ...newChat };
          return updated;
        }

        newChat.hasUnread = msg.direction === "inbound" ? true : false;
        return [...prev, newChat];
      });

      if (window.Notification?.permission === "granted") {
        new Notification(`New message`, {
          body: msg.content,
          icon: "/logo.png",
        });
      }

      // Ask for notification permission
      // window.Notification?.requestPermission();
    });

    return () => eventEmitter.off(subId);
  }, [activePhoneNumber]);
}

function useSubscribeWsFlag(
  setChats: (
    updater: ((prevChats: ChatInfo[]) => ChatInfo[]) | ChatInfo[],
  ) => void,
) {
  useWebsocketEvents("flag-update", (payload) => {
    setChats((prevChats) => {
      return prevChats.map((c) =>
        c.chatId === payload.chatCode ? { ...c, ...payload } : c,
      );
    });
  });
}

function MessagesContainer() {
  const { activePhoneNumber } = useAuthedTwilio();
  const [chats, setChats] = useSortedChats([]);

  useNewMessageListener(activePhoneNumber, setChats);
  useSubscribeWsFlag(setChats);

  return (
    <MessagesLayout
      chats={chats}
      setChats={setChats}
      activePhoneNumber={activePhoneNumber}
    />
  );
}

async function fetchChatsHelper(
  twilioClient: TwilioClient,
  activePhoneNumber: string,
  existingChats: ChatInfo[],
  paginationState: PaginationState | undefined,
  filters: Filters,
) {
  const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
    twilioClient.getChats(activePhoneNumber, {
      paginationState,
      filters,
      existingChatsId: existingChats.map((e) => e.chatId),
    }),
    apiClient.getFlaggedChats(),
  ]);

  if (newChatsResult.status === "rejected") {
    console.error("Failed to fetch chats: ", newChatsResult.reason);
    return { chats: existingChats };
  }

  const { chats: newChats } = newChatsResult.value;

  // Apply unread status
  const unreads = await twilioClient.hasUnread(activePhoneNumber, newChats);
  newChats.forEach((c, i) => {
    c.hasUnread = unreads[i];
  });

  if (flaggedChatsResult.status === "rejected") {
    return newChatsResult.value;
  }

  // Apply flag status to any new matched chats
  const flaggedChats = flaggedChatsResult.value.data.data;
  for (const c of newChats) {
    const found = flaggedChats.find((fc) => fc.chatCode === c.chatId);
    if (found) {
      c.isFlagged = found.isFlagged;
      c.flaggedReason = found.flaggedReason;
      c.flaggedMessage = found.flaggedMessage;
    }
  }

  return newChatsResult.value;
}

export default withAuth(MessagesContainer);
