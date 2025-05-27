import * as React from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedCreds } from "../../context/CredentialsContext";
import { makeChatId } from "../../utils";
import withAuth from "../../context/withAuth";
import { apiClient } from "../../api-client";
import { useWebSocketEvent } from "../../hooks/use-websocket";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import TwilioClient from "../../twilio-client";

// Helper function moved outside component to avoid recreating on each render
const fetchChatsHelper = async (
  twilioClient: TwilioClient,
  activePhoneNumber: string,
  chats: ChatInfo[],
  loadMore = false,
) => {
  const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
    twilioClient.getChats(activePhoneNumber, {
      loadMore,
      existingChatsId: chats.map((e) => e.chatId),
    }),
    apiClient.getFlaggedChats(),
  ]);

  if (newChatsResult.status === "fulfilled") {
    const newChats = newChatsResult.value;

    // Apply flag status to any new matched chats
    if (flaggedChatsResult.status === "fulfilled") {
      const flaggedChats = flaggedChatsResult.value.data.data;
      for (const c of newChats) {
        const found = flaggedChats.find((fc) => fc.chatCode === c.chatId);
        if (found) {
          c.isFlagged = found.isFlagged;
          c.flaggedReason = found.flaggedReason;
          c.flaggedMessage = found.flaggedMessage;
        }
      }
    }

    return { success: true, chats: newChats, loadMore };
  } else {
    console.error("Failed to fetch chats: ", newChatsResult.reason);
    return { success: false };
  }
};

function Messages() {
  const { isAuthenticated, twilioClient, activePhoneNumber, eventEmitter } =
    useAuthedCreds();
  const [chats, setChats] = useSortedChats([]);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    null,
  );

  const selectedChat = React.useMemo(
    () => chats.find((c) => c.chatId === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  useWebSocketEvent("flag-update", (payload) => {
    setChats((prevChats) => {
      return prevChats.map((c) =>
        c.chatId === payload.chatCode ? { ...c, ...payload } : c,
      );
    });
  });

  React.useEffect(() => {
    const subId = eventEmitter.on("new-message", async (msg) => {
      const newMsgActivePhoneNumber =
        msg.direction === "received" ? msg.to : msg.from;
      if (newMsgActivePhoneNumber !== activePhoneNumber) {
        return;
      }

      const newMsgContactNumber =
        msg.direction === "received" ? msg.from : msg.to;
      const newMsgChatId = makeChatId(activePhoneNumber, newMsgContactNumber);

      const newChat: ChatInfo = {
        chatId: newMsgChatId,
        contactNumber: newMsgContactNumber,
        hasUnread: true,
        recentMsgContent: msg.content,
        recentMsgDate: new Date(msg.timestamp),
        recentMsgId: msg.id,
      };

      try {
        const fcs = await apiClient.getFlaggedChats();
        const [fc] = fcs.data.data.filter((e) => e.chatCode === newChat.chatId);
        if (fc) {
          newChat.isFlagged = fc.isFlagged;
          newChat.flaggedReason = fc.flaggedReason;
        }
      } catch (err) {}

      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c.chatId === newMsgChatId);
        if (index !== -1) {
          const updatedChats = [...prevChats];
          updatedChats[index] = {
            ...updatedChats[index],
            ...newChat,
          };
          return updatedChats;
        } else {
          return [...prevChats, newChat];
        }
      });

      if (window.Notification?.permission === "granted") {
        new Notification(`New message ${msg.direction}`, {
          icon: "/logo.png",
          body: msg.content,
        });
      }
    });

    // Ask for notification permission
    window.Notification?.requestPermission();

    const fetchInitialChats = async () => {
      const result = await fetchChatsHelper(
        twilioClient,
        activePhoneNumber,
        chats,
        false,
      );
      if (result.success && result.chats) {
        setChats(result.chats);
      }
    };

    fetchInitialChats();
    setSelectedChatId(null);

    return () => {
      eventEmitter.off(subId);
    };
  }, [isAuthenticated, activePhoneNumber, twilioClient]);

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
        }}
      >
        <ChatsPane
          activePhoneNumber={activePhoneNumber}
          chats={chats}
          selectedChatId={selectedChatId}
          onLoadMore={async () => {
            const result = await fetchChatsHelper(
              twilioClient,
              activePhoneNumber,
              chats,
              true,
            );
            if (result.success && result.chats) {
              setChats((prevChats) => {
                const chatMap = new Map<string, ChatInfo>();
                prevChats.forEach((chat) => chatMap.set(chat.chatId, chat));
                result.chats.forEach((chat) => {
                  if (!chatMap.has(chat.chatId)) {
                    chatMap.set(chat.chatId, chat);
                  }
                });
                return Array.from(chatMap.values());
              });
            }
          }}
          onSearchFilterChange={async (contactNumber) => {
            if (!contactNumber) {
              const result = await fetchChatsHelper(
                twilioClient,
                activePhoneNumber,
                chats,
                false,
              );
              if (result.success && result.chats) {
                setChats(result.chats);
              }
              return;
            }
            const result = await twilioClient.getChat(
              activePhoneNumber,
              contactNumber,
            );
            setChats(result ? [result] : []);
          }}
          setSelectedChat={(chat) => {
            setSelectedChatId(chat ? chat.chatId : chat);
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
            const result = await fetchChatsHelper(
              twilioClient,
              activePhoneNumber,
              chats,
              false,
            );
            if (result.success && result.chats) {
              setChats(result.chats);
            }
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

export default withAuth(Messages);
