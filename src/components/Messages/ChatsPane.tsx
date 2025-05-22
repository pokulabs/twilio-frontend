import { useEffect, useState } from "react";
import {
  IconButton,
  Input,
  Select,
  Option,
  Stack,
  Sheet,
  Typography,
  List,
  Button,
  CircularProgress,
  ListItem,
} from "@mui/joy";
import {
  EditNoteRounded,
  SearchRounded,
  CloseRounded,
} from "@mui/icons-material";

import ChatListItem from "./ChatListItem";
import { toggleMessagesPane } from "../../utils";
import { useAuthedCreds } from "../../context/CredentialsContext";

import type { ChatInfo } from "../../types";

type ChatsPaneProps = {
  activePhoneNumber: string;
  chats: ChatInfo[];
  setSelectedChat: (chat: ChatInfo | null) => void;
  selectedChatId: string | null;
  onLoadMore: () => Promise<void>;
};

export default function ChatsPane(props: ChatsPaneProps) {
  const {
    chats, 
    setSelectedChat, 
    selectedChatId, 
    activePhoneNumber, 
    onLoadMore, 
  } = props;
  
  const { twilioClient, phoneNumbers, setActivePhoneNumber, whatsappNumbers } =
    useAuthedCreds();
  const [contactsFilter, setContactsFilter] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);

  useEffect(() => {
    // Check if there are more chats to load
    setHasMoreChats(twilioClient.hasMoreChats());
  }, [chats]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        height: { sm: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          pb: 1.5,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "md", md: "lg" },
            fontWeight: "lg",
            mr: "auto",
            display: { xs: "none", sm: "unset" },
          }}
        >
          Messages
        </Typography>
        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          onClick={() => {
            setSelectedChat(null);
            if (window.innerWidth < 600) {
              // Approximate `xs` breakpoint
              toggleMessagesPane();
            }
          }}
        >
          <EditNoteRounded />
        </IconButton>
        <IconButton
          variant="plain"
          aria-label="close"
          color="neutral"
          size="sm"
          onClick={() => {
            toggleMessagesPane();
          }}
          sx={{ display: { sm: "none" } }}
        >
          <CloseRounded />
        </IconButton>
      </Stack>
      <Stack sx={{ px: 2, pb: 1.5 }} spacing={1}>
        <Select
          value={activePhoneNumber}
          onChange={(_event, newPhoneNumber) =>
            setActivePhoneNumber(newPhoneNumber!)
          }
        >
          {phoneNumbers.concat(whatsappNumbers).map((e) => {
            return (
              <Option key={e} value={e}>
                {e}
              </Option> // Ensure each Option has a unique key and correct display value
            );
          })}
        </Select>
        <Input
          onChange={(event) => {
            setContactsFilter(event.target.value);
          }}
          value={contactsFilter}
          startDecorator={<SearchRounded />}
          placeholder="Filter contacts"
          endDecorator={
            <IconButton size="sm" onClick={() => setContactsFilter("")}>
              <CloseRounded />
            </IconButton>
          }
        />
      </Stack>
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 0,
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "1rem",
        }}
      >
        {chats.map((chat) => (
          <ChatListItem
            key={chat.chatId}
            chat={chat}
            setSelectedChat={setSelectedChat}
            isSelected={selectedChatId === chat.chatId}
          />
        ))}
        
        {hasMoreChats && (
          <ListItem sx={{ justifyContent: "center", py: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              startDecorator={isLoadingMore ? <CircularProgress size="sm" /> : null}
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </Button>
          </ListItem>
        )}
      </List>
    </Sheet>
  );
}