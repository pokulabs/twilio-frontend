import React, { useState } from "react";
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
  Box,
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
import { Filters, PaginationState } from "../../services/chats.service";
import TwilioClient from "../../twilio-client";
import { apiClient } from "../../api-client";
import { useInitialChatsFetch } from "../../hooks/use-initial-chats-fetch";
import { useNewMessageListener } from "../../hooks/use-new-message-listener";

export default function ChatsPane(props: {
  chats: ChatInfo[];
  selectedChatId?: string;
  onChatSelected: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>;
  filters: Filters;
  onUpdateFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const {
    chats,
    selectedChatId,
    onChatSelected,
    onUpdateChats,
    filters,
    onUpdateFilters,
  } = props;

  const { twilioClient, phoneNumbers, whatsappNumbers } = useAuthedTwilio();
  const [hasMoreLoading, setHasMoreLoading] = useState(false);
  const [paginationState, setPaginationState] = useState<
    PaginationState | undefined
  >(undefined);

  useNewMessageListener(filters.activeNumber, onUpdateChats);
  const { isLoading } = useInitialChatsFetch(
    filters,
    onUpdateChats,
    setPaginationState,
  );

  const handleLoadMore = async () => {
    if (hasMoreLoading) return;

    setHasMoreLoading(true);
    try {
      const newChats = await fetchChatsHelper(
        twilioClient,
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
            onUpdateFilters((prev) => ({
              ...prev,
              activeNumber: newPhoneNumber,
            }));
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
          <SearchContact onUpdateFilters={onUpdateFilters} />
          <MessageFilter
            onChange={(filters) => {
              onUpdateFilters((prev) => ({
                ...prev,
                onlyUnread: filters.onlyUnread,
              }));
            }}
          />
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
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.chatId}
              chat={chat}
              onChatSelected={(chat) => {
                if (!chat) return;
                // Mark chat as read
                onUpdateChats((prevChats) =>
                  prevChats.map((c) =>
                    c.chatId === chat.chatId ? { ...c, hasUnread: false } : c,
                  ),
                );
                onChatSelected(chat.chatId);
              }}
              isSelected={selectedChatId === chat.chatId}
            />
          ))
        )}

        {paginationState?.hasMore && !filters.search && !isLoading && (
          <ListItem sx={{ justifyContent: "center", py: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              disabled={hasMoreLoading}
              onClick={handleLoadMore}
              startDecorator={
                hasMoreLoading ? <CircularProgress size="sm" /> : null
              }
            >
              {hasMoreLoading ? "Loading..." : "Load More"}
            </Button>
          </ListItem>
        )}
      </List>
    </Sheet>
  );
}

function SearchContact(props: {
  onUpdateFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const { onUpdateFilters } = props;
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Input
      sx={{ flex: 1 }}
      onChange={(event) => {
        setInputValue(event.target.value);
      }}
      value={inputValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onUpdateFilters((prev) => ({ ...prev, search: inputValue }));
        }
      }}
      startDecorator={
        <IconButton
          size="sm"
          onClick={() => {
            onUpdateFilters((prev) => ({ ...prev, search: undefined }));
          }}
        >
          <CloseRounded />
        </IconButton>
      }
      endDecorator={
        <IconButton
          variant="soft"
          onClick={() => {
            onUpdateFilters((prev) => ({ ...prev, search: inputValue }));
          }}
          disabled={!inputValue?.trim()}
        >
          <SearchRounded />
        </IconButton>
      }
      placeholder="Search for chat"
    />
  );
}

function MessageFilter(props: {
  onChange: (filters: { onlyUnread: boolean }) => void;
}) {
  const { onChange } = props;
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
  existingChats: ChatInfo[],
  paginationState: PaginationState | undefined,
  filters: Filters,
) {

  let beginningChats: ChatInfo[] = [];
  const chatsWithFlagClaimUnfiltered = await apiClient.getChats({ isFlagged: true, isClaimed: true });
  const chatsWithFlagClaim = chatsWithFlagClaimUnfiltered.data.data.filter((c) => !existingChats.some((e) => e.chatId === c.chatCode));
  if (chatsWithFlagClaim.length > existingChats.length) {
    const newChatsByIds = (await twilioClient.getChatsByIds(chatsWithFlagClaim.map((c) => c.chatCode))).filter(Boolean) as ChatInfo[];
    beginningChats = mergeTwilioAndApiChats(newChatsByIds, chatsWithFlagClaim);
    existingChats.push(...beginningChats);
  }

  const newChatsRes = await twilioClient.getChats(filters.activeNumber, {
    paginationState,
    filters,
    existingChatsId: existingChats.map((e) => e.chatId),
    chatsPageSize: beginningChats.length > 0 ? Math.max(1, 10 - beginningChats.length) : 10,
  });

  const newTwilioChats = newChatsRes.chats;

  if (!newTwilioChats.length) {
    return { ...newChatsRes, chats: beginningChats };
  }

  // Apply unread status
  const unreads = await twilioClient.hasUnread(filters.activeNumber, newTwilioChats);
  newTwilioChats.forEach((c, i) => {
    c.hasUnread = unreads[i];
  });

  let augmentations: Awaited<ReturnType<typeof apiClient.getChats>>;
  try {
    augmentations = await apiClient.getChats({ chatsOfInterest: newTwilioChats.map((c) => c.chatId) });
  } catch (err) {
    return { chats: [...beginningChats, ...newTwilioChats] };
  }

  newChatsRes.chats = mergeTwilioAndApiChats(newTwilioChats, augmentations.data.data);

  return { ...newChatsRes, chats: [...beginningChats, ...newChatsRes.chats] };
}

function mergeTwilioAndApiChats(twilioChats: ChatInfo[], apiChats: Awaited<ReturnType<typeof apiClient.getChats>>["data"]["data"]) {
  const mergedChats = [...twilioChats];
  for (const c of mergedChats) {
    const found = apiChats.find((fc) => c.chatId === fc.chatCode);
    if (found) {
      Object.assign(c, found);
    }
  }
  return mergedChats;
}
