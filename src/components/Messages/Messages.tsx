import { useState } from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import withTwilio from "../../context/withTwilio";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";

import type { ChatInfo } from "../../types";
import { Filters } from "../../services/chats.service";
import { useAuthedTwilio } from "../../context/TwilioProvider";

function MessagesLayout() {
  const { phoneNumbers, twilioClient } = useAuthedTwilio();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    activeNumber: phoneNumbers[0],
  });
  const [chats, setChats] = useState<ChatInfo[]>([]);

  const selectedChat = chats.find((c) => c.chatId === selectedChatId) ?? null;

  useSubscribeWs(setChats);

  return (
    <>
      <ChatsPane
        chats={chats}
        selectedChatId={selectedChat?.chatId}
        onUpdateChats={setChats}
        onChatSelected={setSelectedChatId}
        filters={filters}
        onUpdateFilters={setFilters}
      />
      {selectedChat ? (
        <MessagesPane chat={selectedChat} />
      ) : (
        <NewMessagesPane
          callback={(activeNumber, contactNumber) => {
            twilioClient
              .getChat(activeNumber, contactNumber)
              .then((res) => setSelectedChatId(res?.chatId ?? null));
          }}
          activePhoneNumber={filters.activeNumber}
        />
      )}
    </>
  );
}

function useSubscribeWs(
  setChats: (
    updater: ((prevChats: ChatInfo[]) => ChatInfo[]) | ChatInfo[],
  ) => void,
) {
  useWebsocketEvents("chat-update", (payload) => {
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

export default withTwilio(MessagesContainer);
