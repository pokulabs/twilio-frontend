import { useState } from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import withAuth from "../../context/withAuth";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import { Filters } from "../../services/contacts.service";
import { useAuthedTwilio } from "../../context/TwilioProvider";

function MessagesLayout() {
  const { phoneNumbers, twilioClient } = useAuthedTwilio();
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [filters, setFilters] = useState<Filters>({ activeNumber: phoneNumbers[0] });
  const [chats, setChats] = useSortedChats([]);

  useSubscribeWsFlag(setChats);

  return (
    <>
      <ChatsPane
        chats={chats}
        selectedChatId={selectedChat?.chatId}
        onUpdateChats={setChats}
        onChatSelected={setSelectedChat}
        filters={filters}
        onUpdateFilters={setFilters}
      />
      {selectedChat ? (
        <MessagesPane
          chat={selectedChat}
        />
      ) : (
        <NewMessagesPane
          callback={(activeNumber, contactNumber) => {
            twilioClient.getChat(activeNumber, contactNumber)
            .then(res => setSelectedChat(res ?? null));
          }}
          activePhoneNumber={filters.activeNumber}
        />
      )}
    </>
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
      <MessagesLayout />
    </Sheet>
  );
}

export default withAuth(MessagesContainer);
