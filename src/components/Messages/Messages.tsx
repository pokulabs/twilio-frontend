import React, { useState, useEffect } from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import { useAuthedTwilio } from "../../context/TwilioProvider";
import withAuth from "../../context/withAuth";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import { useNewMessageListener } from "../../hooks/use-new-message-listener";
import { makeChatId } from "../../utils";

function MessagesLayout(props: {
  chats: ChatInfo[];
  setChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  activePhoneNumber: string;
}) {
  const { chats, setChats, activePhoneNumber } = props;
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);

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
          selectedChat={selectedChat}
          onUpdateChats={setChats}
          onChatSelected={(chat) => {
            setSelectedChat(chat ?? null);
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
            // const newChats = await fetchChatsHelper(
            //   twilioClient,
            //   activePhoneNumber,
            //   chats,
            //   undefined,
            //   filters,
            // );
            // setPaginationState(newChats.paginationState);
            // setChats(newChats.chats);
            // const chat = newChats.chats.find(
            //   (e) => e.contactNumber === contactNumber,
            // );
            // if (chat) {
            //   setSelectedChat(chat);
            // }
            
            setSelectedChat(chats.find(c => c.chatId === makeChatId(activePhoneNumber, contactNumber)) ?? null);
          }}
          activePhoneNumber={activePhoneNumber}
        />
      )}
    </Sheet>
  );
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

export default withAuth(MessagesContainer);
