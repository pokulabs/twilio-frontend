import React, { useEffect, useState } from "react";
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
  Badge,
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
import { Filters, PaginationState } from "../../services/contacts.service";
import TwilioClient from "../../twilio-client";
import { apiClient } from "../../api-client";
import { useInitialChatsFetch } from "../../hooks/use-initial-chats-fetch";
import { useNewMessageListener } from "../../hooks/use-new-message-listener";


export default function ChatsPane(props: {
  chats: ChatInfo[];
  selectedChat: ChatInfo | null;
  onChatSelected: React.Dispatch<React.SetStateAction<ChatInfo | null>>;
  onUpdateChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  filters: Filters;
  onUpdateFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const {
    chats,
    selectedChat,
    onChatSelected,
    onUpdateChats,
    filters,
    onUpdateFilters,
  } = props;

  const { twilioClient, phoneNumbers, whatsappNumbers } =
    useAuthedTwilio();
  const [contactsFilter, setContactsFilter] = useState("");
  const [hasMoreLoading, setHasMoreLoading] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [paginationState, setPaginationState] = useState<PaginationState | undefined>(undefined);

  useNewMessageListener(filters.activeNumber, onUpdateChats);
  useInitialChatsFetch(filters.activeNumber, filters, onUpdateChats, setPaginationState);

  useEffect(() => {
    // Check if there are more chats to load
    setHasMoreChats(twilioClient.hasMoreChats(paginationState));
  }, [chats, paginationState]);

  const handleLoadMore = async () => {
    if (hasMoreLoading) return;

    setHasMoreLoading(true);
    try {
      const newChats = await fetchChatsHelper(
        twilioClient,
        filters.activeNumber,
        chats,
        paginationState,
        filters,
      );
      setPaginationState(newChats.paginationState);
      onUpdateChats((prevChats) => {
        const chatMap = new Map<string, ChatInfo>();
        prevChats.forEach((chat) => chatMap.set(chat.chatId, chat));
        newChats.chats.forEach((chat) => {
          if (!chatMap.has(chat.chatId)) {
            chatMap.set(chat.chatId, chat);
          }
        });
        return Array.from(chatMap.values());
      });
    } finally {
      setHasMoreLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!contactsFilter.trim() || isSearching) return;

    setIsSearching(true);
    try {
      onUpdateFilters(prev => ({ ...prev, search: contactsFilter ?? undefined }));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
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

        borderRight: "1px solid",
        borderColor: "divider",
        // height: { sm: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        // height: "100%", // or `calc(100dvh - HEADER_HEIGHT)` if needed
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
            onChatSelected(null);
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
          value={filters.activeNumber}
          onChange={(_event, newPhoneNumber) => {
            if (!newPhoneNumber) return;
            onUpdateFilters(prev => ({ ...prev, activeNumber: newPhoneNumber }))
          }}
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
                onUpdateFilters(prev => ({ ...prev, search: undefined }));
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
                  onUpdateFilters(prev => ({ ...prev, search: undefined }));
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
          <MessageFilter onChange={(filters => {
            onUpdateFilters(prev => ({ ...prev, onlyUnread: filters.onlyUnread }));
          })} />
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
            onChatSelected={(chat => {
              if (!chat) return;
              // Mark chat as read
              onUpdateChats((prevChats) =>
                prevChats.map((c) =>
                  c.chatId === chat.chatId ? { ...c, hasUnread: false } : c,
                ),
              );
              onChatSelected(chat);
            })}
            isSelected={selectedChat?.chatId === chat.chatId}
          />
        ))}

        {hasMoreChats && !contactsFilter && (
          <ListItem sx={{ justifyContent: "center", py: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              disabled={hasMoreLoading}
              onClick={handleLoadMore}
              startDecorator={hasMoreLoading ? <CircularProgress size="sm" /> : null}
            >
              {hasMoreLoading ? "Loading..." : "Load More"}
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
        <Badge invisible={!onlyUnread}>
          <FilterAltOutlined />
        </Badge>
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


export async function fetchChatsHelper(
  twilioClient: TwilioClient,
  activePhoneNumber: string,
  existingChats: ChatInfo[],
  paginationState: PaginationState | undefined,
  filters: Filters,
) {
  const [newChatsResult, flaggedChatsResult] = await Promise.allSettled([
    twilioClient.getChats(activePhoneNumber, {
      paginationState,
      filters,
      existingChatsId: existingChats.map((e) => e.chatId),
    }),
    apiClient.getFlaggedChats(),
  ]);

  if (newChatsResult.status === "rejected") {
    console.error("Failed to fetch chats: ", newChatsResult.reason);
    return { chats: existingChats };
  }

  const { chats: newChats } = newChatsResult.value;

  // Apply unread status
  const unreads = await twilioClient.hasUnread(activePhoneNumber, newChats);
  newChats.forEach((c, i) => {
    c.hasUnread = unreads[i];
  });

  if (flaggedChatsResult.status === "rejected") {
    return newChatsResult.value;
  }

  // Apply flag status to any new matched chats
  const flaggedChats = flaggedChatsResult.value.data.data;
  for (const c of newChats) {
    const found = flaggedChats.find((fc) => fc.chatCode === c.chatId);
    if (found) {
      c.isFlagged = found.isFlagged;
      c.flaggedReason = found.flaggedReason;
      c.flaggedMessage = found.flaggedMessage;
    }
  }

  return newChatsResult.value;
}