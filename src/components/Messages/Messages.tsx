import * as React from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedCreds } from "../../context/CredentialsContext";
import { makeChatId } from "../../utils";
import withAuth from "../../context/withAuth";

import type { ChatInfo } from "../../types";
import { apiClient } from "../../api-client";
import { useWebSocketEvent } from "../../hooks/use-websocket";
import { useSortedChats } from "../../hooks/use-sorted-chats";

function Messages() {
  const { isAuthenticated, twilioClient, activePhoneNumber, eventEmitter } =
    useAuthedCreds();
  const [chats, setChats] = useSortedChats([]);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);

  const selectedChat = React.useMemo(
    () => chats.find((c) => c.chatId === selectedChatId) ?? null,
    [chats, selectedChatId]
  );

  useWebSocketEvent("flag-update", (payload) => {
    setChats((prevChats) => {
      return prevChats.map((c) =>
        c.chatId === payload.chatCode ? { ...c, ...payload } : c,
      );
    });
  });

  React.useEffect(() => {
    const subId = eventEmitter.on("new-message", (msg) => {
      const newMsgContactNumber =
        msg.from === activePhoneNumber ? msg.to : msg.from;
      const newMsgChatId = makeChatId(activePhoneNumber, newMsgContactNumber);

      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c.chatId === newMsgChatId);
        const newChat: ChatInfo = {
          chatId: newMsgChatId,
          contactNumber: newMsgContactNumber,
          hasUnread: true,
          recentMsgContent: msg.content,
          recentMsgDate: new Date(msg.timestamp),
          recentMsgId: msg.id,
        };

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

    return () => {
      eventEmitter.off(subId);
    };
  }, [isAuthenticated]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
        twilioClient.getChats(activePhoneNumber),
        apiClient.getFlaggedChats(),
      ]);

      if (newChatsResult.status === "fulfilled") {
        const newChats = newChatsResult.value;
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

        setChats(newChats);
      } else {
        console.error("Failed to fetch chats: ", newChatsResult.reason);
      }
    };

    fetchData();
    setSelectedChatId(null);
  }, [isAuthenticated, activePhoneNumber]);

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
          setSelectedChat={(chat) => {
            setSelectedChatId(chat ? chat.chatId : chat);
            if (chat) {
              // Mark chat as read
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
            try {
              const chatsData = await twilioClient.getChats(activePhoneNumber)!;
              const chat = chatsData.filter(
                (e) => e.contactNumber === contactNumber,
              )[0];
              setChats(chatsData);
              setSelectedChatId(chat.chatId);
            } catch (error) {
              console.error("Failed to fetch chats:", error);
            }
          }}
          activePhoneNumber={activePhoneNumber}
        />
      )}
    </Sheet>
  );
}

export default withAuth(Messages);
