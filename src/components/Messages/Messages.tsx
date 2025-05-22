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
    const subId = eventEmitter.on("new-message", (msg) => {
      const newMsgActivePhoneNumber =
        msg.direction === "received" ? msg.to : msg.from;
      if (newMsgActivePhoneNumber !== activePhoneNumber) {
        return;
      }

      const newMsgContactNumber =
        msg.direction === "received" ? msg.from : msg.to;
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

  const fetchChats = React.useCallback(async (loadMore = false) => {
      const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
        twilioClient.getChats(activePhoneNumber, loadMore),
        apiClient.getFlaggedChats(),
      ]);

      if (newChatsResult.status === "fulfilled") {
        const newChats = newChatsResult.value;

        // Apply flag status to any new matched chats
        // TODO: what if a flagged chat is not in currently loaded chats
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

        if (loadMore) {
          // Merge new chats with existing chats
          setChats((prevChats) => {
            // Create a map of chatIds to filter out duplicates
            const chatMap = new Map<string, ChatInfo>();
            
            // Add all existing chats to the map
            prevChats.forEach(chat => chatMap.set(chat.chatId, chat));
            
            // Add or update with new chats
            newChats.forEach(chat => {
              // Only add if it doesn't already exist
              if (!chatMap.has(chat.chatId)) {
                chatMap.set(chat.chatId, chat);
              }
            });
            
            // Convert map back to array
            return Array.from(chatMap.values());
          });
        } else {
          setChats(newChats);
        }
      } else {
        console.error("Failed to fetch chats: ", newChatsResult.reason);
      }
  }, [twilioClient, activePhoneNumber]);

  // Handle loading more chats
  const handleLoadMore = React.useCallback(async () => {
    await fetchChats(true);
  }, [fetchChats]);

  React.useEffect(() => {
    fetchChats();
    setSelectedChatId(null);
  }, [isAuthenticated, activePhoneNumber, fetchChats]);

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
          onLoadMore={handleLoadMore}
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
