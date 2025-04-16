import * as React from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedCreds } from "../../context/CredentialsContext";
import { makeChatId } from "../../utils";
import withAuth from "../../context/withAuth";

import type { ChatInfo } from "../../types";

function Messages() {
  const { isAuthenticated, twilioClient, activePhoneNumber, eventEmitter } =
    useAuthedCreds();
  const [chats, setChats] = React.useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<ChatInfo | null>(null);

  React.useEffect(() => {
    const subId = eventEmitter.on("new-message", (msg) => {
      const newMsgContactNumber =
        msg.from === activePhoneNumber ? msg.to : msg.from;
      const newMsgChatId = makeChatId(activePhoneNumber, newMsgContactNumber);

      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c.chatId === newMsgChatId);
        if (index !== -1) {
          const updatedChats = [...prevChats];
          updatedChats[index] = {
            chatId: newMsgChatId,
            contactNumber: newMsgContactNumber,
            hasUnread: true,
            recentMsgContent: msg.content,
            recentMsgDate: new Date(msg.timestamp),
            recentMsgId: msg.id,
          };
          return updatedChats;
        } else {
          return [
            ...prevChats,
            {
              chatId: newMsgChatId,
              contactNumber: newMsgContactNumber,
              hasUnread: true,
              recentMsgContent: msg.content,
              recentMsgDate: new Date(msg.timestamp),
              recentMsgId: msg.id,
            },
          ];
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

    return () => eventEmitter.off(subId);
  }, [isAuthenticated]);

  React.useEffect(() => {
    twilioClient
      .getChats(activePhoneNumber)
      .then((chats) => setChats(chats))
      .catch((err) => console.error("Failed to fetch chats:", err));

    setSelectedChat(null);
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
          selectedChatId={selectedChat?.chatId}
          setSelectedChat={(chat) => {
            setSelectedChat(chat);
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
              setSelectedChat(chat);
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
