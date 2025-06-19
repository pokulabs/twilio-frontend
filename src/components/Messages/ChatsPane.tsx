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

function useInitialChatsFetch(
  activePhoneNumber: string,
  filters: Filters,
  onUpdateChats: (chats: ChatInfo[]) => void,
  setPaginationState: (paginationState: PaginationState | undefined) => void,
) {
  const { twilioClient } = useAuthedTwilio();

  useEffect(() => {
    const loadChats = async () => {
      if (!twilioClient || !activePhoneNumber) return;

      if (filters.search) {
        const chat = await twilioClient.getChat(
          activePhoneNumber,
          filters.search,
        );
        if (chat && filters.onlyUnread) {
          const [isUnread] = await twilioClient.hasUnread(activePhoneNumber, [chat]);
          // Apply unread status
          onUpdateChats(chat && isUnread ? [{ ...chat, hasUnread: true }] : []);
        } else {
          onUpdateChats(chat ? [chat] : []);
        }
        return;
      }

      const newChats = await fetchChatsHelper(
        twilioClient,
        activePhoneNumber,
        [],
        undefined,
        filters,
      );
      setPaginationState(newChats.paginationState);
      onUpdateChats(newChats.chats);
    };

    loadChats();
  }, [twilioClient, activePhoneNumber, filters]);
}

export default function ChatsPane(props: {
  activePhoneNumber: string;
  chats: ChatInfo[];
  onChatSelected: React.Dispatch<React.SetStateAction<ChatInfo | null>>;
  onUpdateChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  selectedChat: ChatInfo | null;
}) {
  const {
    chats,
    onChatSelected,
    onUpdateChats,
    selectedChat,
    activePhoneNumber,
  } = props;

  const { twilioClient, phoneNumbers, setActivePhoneNumber, whatsappNumbers } =
    useAuthedTwilio();
  const [contactsFilter, setContactsFilter] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [paginationState, setPaginationState] = useState<PaginationState | undefined>(undefined);

  useInitialChatsFetch(activePhoneNumber, filters, onUpdateChats, setPaginationState)

  useEffect(() => {
    // Check if there are more chats to load
    setHasMoreChats(twilioClient.hasMoreChats(paginationState));
  }, [chats, paginationState]);

  const handleLoadMore = async () => {
    if (hasMore) return;

    setHasMore(true);
    try {
      const newChats = await fetchChatsHelper(
        twilioClient,
        activePhoneNumber,
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
      setHasMore(false);
    }
  };

  const handleSearch = async () => {
    if (!contactsFilter.trim() || isSearching) return;

    setIsSearching(true);
    try {
      setFilters(prev => ({ ...prev, search: contactsFilter ?? undefined }));
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
                setFilters(prev => ({ ...prev, search: undefined }));
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
                  setFilters(prev => ({ ...prev, search: undefined }));
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
            setFilters(prev => ({ ...prev, onlyUnread: filters.onlyUnread }));
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