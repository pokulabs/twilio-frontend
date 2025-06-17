import * as React from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedCreds } from "../../context/CredentialsContext";
import { makeChatId } from "../../utils";
import withAuth from "../../context/withAuth";
import { apiClient } from "../../api-client";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import TwilioClient from "../../twilio-client";
import { useEffect, useState } from "react";

function useInitialChatsFetch(activePhoneNumber: string, onlyUnread: boolean, searchFilter: string | null, setChats: (chats: ChatInfo[]) => void) {
  const { twilioClient } = useAuthedCreds();

  useEffect(() => {
    const loadChats = async () => {
      if (!twilioClient || !activePhoneNumber) return;

      if (searchFilter) {
        const result = await twilioClient.getChat(
          activePhoneNumber,
          searchFilter
        );
        setChats(result ? [result] : []);
        return;
      }

      const newChats = await fetchChatsHelper(
        twilioClient,
        activePhoneNumber,
        [],
        false,
        onlyUnread
      );
      setChats(newChats);
    };

    loadChats();
  }, [twilioClient, activePhoneNumber, onlyUnread, searchFilter]);
}

function MessagesLayout(props: {
  chats: ChatInfo[];
  setChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  activePhoneNumber: string;
}) {
  const { chats, setChats, activePhoneNumber } = props;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    null,
  );
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchFilter, setSearchFilter] = useState<string | null>(null);
  const { twilioClient } = useAuthedCreds();

  const selectedChat = React.useMemo(
    () => chats.find((c) => c.chatId === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  useInitialChatsFetch(activePhoneNumber, onlyUnread, searchFilter, setChats);

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
          selectedChatId={selectedChatId}
          onMessageFilterChange={filters => {
            setOnlyUnread(filters.onlyUnread);
          }}
          onSearchFilterChange={contactNumber => {
            setSearchFilter(contactNumber || null);
          }}
          onLoadMore={async () => {
            const newChats = await fetchChatsHelper(
              twilioClient,
              activePhoneNumber,
              chats,
              true,
              onlyUnread,
            );
            setChats((prevChats) => {
              const chatMap = new Map<string, ChatInfo>();
              prevChats.forEach((chat) => chatMap.set(chat.chatId, chat));
              newChats.forEach((chat) => {
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
              false,
              onlyUnread,
            );
            setChats(newChats);
            const chat = chats.filter(
              (e) => e.contactNumber === contactNumber,
            )[0];
            setSelectedChatId(chat.chatId);
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
  const { eventEmitter } = useAuthedCreds();

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
  const { activePhoneNumber } = useAuthedCreds();
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
  loadMore: boolean,
  onlyUnread: boolean,
) {
  const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
    twilioClient.getChats(activePhoneNumber, {
      loadMore,
      onlyUnread,
      existingChatsId: existingChats.map((e) => e.chatId),
    }),
    apiClient.getFlaggedChats(),
  ]);

  if (newChatsResult.status === "rejected") {
    console.error("Failed to fetch chats: ", newChatsResult.reason);
    return existingChats;
  }

  const newChats = newChatsResult.value;

  // Apply unread status
  const unreads = await twilioClient.hasUnread(activePhoneNumber, newChats);
  newChats.forEach((c, i) => {
    c.hasUnread = unreads[i];
  });

  if (flaggedChatsResult.status === "rejected") {
    return newChats;
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

  return newChats;
}

export default withAuth(MessagesContainer);
