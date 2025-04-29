import { useState } from "react";
import {
  IconButton,
  Input,
  Select,
  Option,
  Stack,
  Sheet,
  Typography,
  List,
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
};

export default function ChatsPane(props: ChatsPaneProps) {
  const { chats, setSelectedChat, selectedChatId, activePhoneNumber } = props;
  const { phoneNumbers, setActivePhoneNumber, whatsappNumbers } =
    useAuthedCreds();
  const [contactsFilter, setContactsFilter] = useState("");

  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        height: { sm: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        overflowY: "auto",
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
          aria-label="edit"
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
          py: 0,
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "1rem",
        }}
      >
        {chats
          .filter((e) => e.contactNumber.includes(contactsFilter))
          .map((chat) => (
            <ChatListItem
              key={chat.chatId}
              chat={chat}
              setSelectedChat={setSelectedChat}
              isSelected={selectedChatId === chat.chatId}
            />
          ))}
      </List>
    </Sheet>
  );
}
