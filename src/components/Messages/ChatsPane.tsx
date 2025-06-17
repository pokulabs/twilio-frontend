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
  Menu,
  Checkbox,
  Dropdown,
  MenuButton,
} from "@mui/joy";
import {
  EditNoteRounded,
  SearchRounded,
  CloseRounded,
  FilterAltOutlined,
} from "@mui/icons-material";

import ChatListItem from "./ChatListItem";
import { toggleMessagesPane } from "../../utils";
import { useAuthedTwilio } from "../../context/TwilioProvider";

import type { ChatInfo } from "../../types";

type ChatsPaneProps = {
  activePhoneNumber: string;
  chats: ChatInfo[];
  setSelectedChat: (chat: ChatInfo | null) => void;
  selectedChatId: string | null;
  onLoadMore: () => Promise<void>;
  onSearchFilterChange: (contactNumber: string) => void;
  onMessageFilterChange: (filters: { onlyUnread: boolean }) => void;
};

export default function ChatsPane(props: ChatsPaneProps) {
  const {
    chats,
    setSelectedChat,
    selectedChatId,
    activePhoneNumber,
    onLoadMore,
    onSearchFilterChange,
    onMessageFilterChange,
  } = props;

  const { twilioClient, phoneNumbers, setActivePhoneNumber, whatsappNumbers } =
    useAuthedTwilio();
  const [contactsFilter, setContactsFilter] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Check if there are more chats to load
    setHasMoreChats(twilioClient.hasMoreChats());
  }, [chats]);

  const handleLoadMore = async () => {
    if (hasMore) return;

    setHasMore(true);
    try {
      await onLoadMore();
    } finally {
      setHasMore(false);
    }
  };

  const handleSearch = async () => {
    if (!contactsFilter.trim() || isSearching) return;

    setIsSearching(true);
    try {
      onSearchFilterChange(contactsFilter);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        // height: { sm: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        height: "100%", // or `calc(100dvh - HEADER_HEIGHT)` if needed
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
        <Stack direction="row" spacing={1}>
          <Input
            sx={{ flex: 1 }}
            onChange={(event) => {
              setContactsFilter(event.target.value);
              if (!event.target.value) {
                onSearchFilterChange("");
              }
            }}
            value={contactsFilter}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            startDecorator={
              <IconButton
                size="sm"
                onClick={() => {
                  setContactsFilter("");
                  onSearchFilterChange("");
                }}
              >
                <CloseRounded />
              </IconButton>
            }
            endDecorator={
              <IconButton
                variant="soft"
                onClick={handleSearch}
                disabled={isSearching || !contactsFilter.trim()}
              >
                {isSearching ? (
                  <CircularProgress size="sm" />
                ) : (
                  <SearchRounded />
                )}
              </IconButton>
            }
            placeholder="Search for chat"
          />
          <MessageFilter onChange={onMessageFilterChange} />
        </Stack>
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

        {hasMoreChats && !contactsFilter && (
          <ListItem sx={{ justifyContent: "center", py: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              disabled={hasMore}
              onClick={handleLoadMore}
              startDecorator={hasMore ? <CircularProgress size="sm" /> : null}
            >
              {hasMore ? "Loading..." : "Load More"}
            </Button>
          </ListItem>
        )}
      </List>
    </Sheet>
  );
}

type MessageFilterProps = {
  onChange: (filters: { onlyUnread: boolean }) => void;
};

function MessageFilter({ onChange }: MessageFilterProps) {
  const [onlyUnread, setOnlyUnread] = useState(false);

  return (
    <Dropdown>
      <MenuButton slots={{ root: IconButton }}>
        <FilterAltOutlined />
      </MenuButton>
      <Menu
        sx={{
          p: 2,
          gap: 1,
          width: 250,
        }}
      >
        <Typography level="title-sm">Filters</Typography>
        <Sheet>
          <Checkbox
            label="Only unread"
            checked={onlyUnread}
            onChange={(event) => {
              setOnlyUnread(event.target.checked);
              onChange({ onlyUnread: event.target.checked });
            }}
          />
        </Sheet>
      </Menu>
    </Dropdown>
  );
}
