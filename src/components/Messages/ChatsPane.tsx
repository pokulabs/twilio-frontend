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
  Box,
  Autocomplete,
  AutocompleteOption,
} from "@mui/joy";
import {
  EditNoteRounded,
  SearchRounded,
  CloseRounded,
  FilterAltOutlined,
  Circle,
} from "@mui/icons-material";

import ChatListItem from "./ChatListItem";
import { parseChatId, toggleMessagesPane } from "../../utils";
import { useAuthedTwilio } from "../../context/TwilioProvider";

import type { ChatInfo } from "../../types/types";
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
                labelIds: filters.labelIds,
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
  onChange: (filters: { onlyUnread: boolean; labelIds: string[] }) => void;
}) {
  const { onChange } = props;
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [filterableLabels, setFilterableLabels] = useState<
    NonNullable<
      Awaited<ReturnType<typeof apiClient.listUserLabels>>["data"]
    >["data"]
  >([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<
    NonNullable<
      Awaited<ReturnType<typeof apiClient.listUserLabels>>["data"]
    >["data"]
  >([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const res = await apiClient.listUserLabels();
      setFilterableLabels(res.data?.data ?? []);
    };
    fetchLabels();
  }, []);

  return (
    <Dropdown>
      <MenuButton slots={{ root: IconButton }}>
        <Badge invisible={!onlyUnread && !selectedLabelIds.length}>
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
              onChange({
                onlyUnread: event.target.checked,
                labelIds: selectedLabelIds.map((id) => id.id),
              });
            }}
          />
        </Sheet>

        <Autocomplete
          value={selectedLabelIds}
          onChange={(_event, newIds) => {
            setSelectedLabelIds(newIds);
            onChange({ onlyUnread, labelIds: newIds.map((id) => id.id) });
          }}
          multiple
          disableCloseOnSelect
          noOptionsText="No labels found"
          options={filterableLabels}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          placeholder="Label(s) to filter by"
          renderOption={(props, option) => (
            <AutocompleteOption {...props} key={option.id}>
              <Circle sx={{ fontSize: 14, color: option.color }} />
              {option.name}
            </AutocompleteOption>
          )}
        />
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
  let priorityChats: ChatInfo[] = [];

  // If filtering by labels, fetch those chats directly from API, then hydrate via Twilio
  if (filters.labelIds?.length) {
    const labeledChatsRes = await apiClient.getChats({
      labelIds: filters.labelIds,
    });
    const apiChats = labeledChatsRes.data?.data ?? [];

    const relevantLabeled = apiChats.filter((c) => {
      if (!filters.activeNumber) return true;
      return parseChatId(c.chatCode).activeNumber === filters.activeNumber;
    });

    if (!relevantLabeled.length) {
      return { chats: [], paginationState: undefined };
    }

    const twilioLabeled = (
      await twilioClient.getChatsByIds(relevantLabeled.map((c) => c.chatCode))
    ).filter(Boolean) as ChatInfo[];

    if (twilioLabeled.length) {
      const unreads = await twilioClient.hasUnread(
        filters.activeNumber,
        twilioLabeled,
      );
      twilioLabeled.forEach((c, i) => {
        c.hasUnread = unreads[i];
      });
    }

    let mergedLabeled = mergeTwilioAndApiChats(twilioLabeled, relevantLabeled);

    if (filters.onlyUnread) {
      mergedLabeled = mergedLabeled.filter((c) => !!c.hasUnread);
    }

    mergedLabeled.sort(
      (a, b) => b.recentMsgDate.getTime() - a.recentMsgDate.getTime(),
    );

    return { chats: mergedLabeled, paginationState: undefined };
  }

  const chatsWithFlagClaim = await apiClient.getChats({
    isFlagged: true,
    isClaimed: true,
  });
  const relevantChats = chatsWithFlagClaim.data?.data.filter((c) => {
    if (!filters.activeNumber) return true;
    return parseChatId(c.chatCode).activeNumber === filters.activeNumber;
  });

  if (relevantChats?.length) {
    const newChatsByIds = (
      await twilioClient.getChatsByIds(relevantChats.map((c) => c.chatCode))
    ).filter(Boolean) as ChatInfo[];
    priorityChats = mergeTwilioAndApiChats(newChatsByIds, relevantChats);
    existingChats.push(...priorityChats);
  }

  const newChatsRes = await twilioClient.getChats(filters.activeNumber, {
    paginationState,
    onlyUnread: filters.onlyUnread,
    existingChatsId: existingChats.map((e) => e.chatId),
    chatsPageSize:
      priorityChats.length > 0 ? Math.max(1, 10 - priorityChats.length) : 10,
  });

  const newTwilioChats = newChatsRes.chats;

  if (!newTwilioChats.length) {
    return { ...newChatsRes, chats: priorityChats };
  }

  // Apply unread status
  const unreads = await twilioClient.hasUnread(
    filters.activeNumber,
    newTwilioChats,
  );
  newTwilioChats.forEach((c, i) => {
    c.hasUnread = unreads[i];
  });

  const augmentations = await apiClient.getChats({
    chatsOfInterest: newTwilioChats.map((c) => c.chatId),
  });
  if (!augmentations.data || !augmentations.data.data.length) {
    return { ...newChatsRes, chats: [...priorityChats, ...newTwilioChats] };
  }

  const augmentedChats = mergeTwilioAndApiChats(
    newTwilioChats,
    augmentations.data.data,
  );
  return { ...newChatsRes, chats: [...priorityChats, ...augmentedChats] };
}

function mergeTwilioAndApiChats(
  twilioChats: ChatInfo[],
  apiChats: NonNullable<
    Awaited<ReturnType<typeof apiClient.getChats>>["data"]
  >["data"],
) {
  const mergedChats = [...twilioChats];
  for (const c of mergedChats) {
    const found = apiChats.find((fc) => c.chatId === fc.chatCode);
    if (found) {
      Object.assign(c, found);
    }
  }
  return mergedChats;
}
