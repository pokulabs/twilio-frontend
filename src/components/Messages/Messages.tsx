import { useState } from "react";
import { Sheet } from "@mui/joy";

import MessagesPane from "./MessagesPane";
import ChatsPane from "./ChatsPane";
import NewMessagesPane from "./NewMessagePane";
import withAuth from "../../context/withAuth";
import { useWebsocketEvents } from "../../hooks/use-websocket-events";
import { useSortedChats } from "../../hooks/use-sorted-chats";

import type { ChatInfo } from "../../types";
import { makeChatId } from "../../utils";
import { Filters } from "../../services/contacts.service";
import { useAuthedTwilio } from "../../context/TwilioProvider";

function MessagesLayout() {
  const { phoneNumbers } = useAuthedTwilio();
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [filters, setFilters] = useState<Filters>({ activeNumber: phoneNumbers[0] });
  const [chats, setChats] = useSortedChats([]);

  useSubscribeWsFlag(setChats);

  return (
    <>
      <ChatsPane
        chats={chats}
        selectedChat={selectedChat}
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
            
            setSelectedChat(chats.find(c => c.chatId === makeChatId(filters.activeNumber, contactNumber)) ?? null);
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
