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
  onChange: (filters: { onlyUnread: boolean; labelIds?: string[] }) => void;
}) {
  const { onChange } = props;
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [labels, setLabels] = useState<{ id: string; name: string; color: string }[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(true);
  const [labelSearch, setLabelSearch] = useState("");

  // Function to load labels
  const loadLabels = async () => {
    setLabelsLoading(true);
    try {
      const response = await apiClient.listUserLabels();
      setLabels(response.data.data);
    } catch (err) {
      console.error("Failed to load labels:", err);
    } finally {
      setLabelsLoading(false);
    }
  };

  // Load labels on mount
  React.useEffect(() => {
    loadLabels();
  }, []);

  // Refresh labels when dropdown opens
  const handleOpenChange = (_event: any, open: boolean) => {
    if (open) {
      loadLabels();
      setLabelSearch(""); // Reset search when opening
    }
  };

  const handleLabelToggle = (labelId: string) => {
    const newSelectedLabels = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter((id) => id !== labelId)
      : [...selectedLabelIds, labelId];
    
    setSelectedLabelIds(newSelectedLabels);
    onChange({ 
      onlyUnread, 
      labelIds: newSelectedLabels.length > 0 ? newSelectedLabels : undefined 
    });
  };

  // Filter labels based on search
  const filteredLabels = labelSearch.trim() 
    ? labels.filter(label => 
        label.name.toLowerCase().includes(labelSearch.toLowerCase())
      )
    : labels;

  const hasActiveFilters = onlyUnread || selectedLabelIds.length > 0;


  return (
    <Dropdown onOpenChange={handleOpenChange}>
      <MenuButton slots={{ root: IconButton }}>
        <Badge invisible={!hasActiveFilters}>
          <FilterAltOutlined />
        </Badge>
      </MenuButton>
      <Menu
        sx={{
          p: 2,
          gap: 1,
          width: 280,
          maxHeight: 300,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
                labelIds: selectedLabelIds.length > 0 ? selectedLabelIds : undefined 
              });
            }}
          />
        </Sheet>
        
        {labels.length > 0 && (
          <>
            <Typography level="title-sm" sx={{ mt: 1 }}>Labels</Typography>
            
            {/* Search input */}
            <Input
              size="sm"
              placeholder="Search labels..."
              value={labelSearch}
              onChange={(e) => setLabelSearch(e.target.value)}
              startDecorator={<SearchRounded fontSize="small" />}
              endDecorator={
                labelSearch && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    onClick={() => setLabelSearch("")}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                )
              }
            />
            
            {/* Scrollable labels list */}
            <Sheet 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 0.5,
                maxHeight: 250,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {filteredLabels.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary", py: 2, textAlign: "center" }}>
                  No labels found
                </Typography>
              ) : (
                filteredLabels.map((label) => (
                  <Checkbox
                    key={label.id}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: label.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography level="body-sm">{label.name}</Typography>
                      </Box>
                    }
                    checked={selectedLabelIds.includes(label.id)}
                    onChange={() => handleLabelToggle(label.id)}
                  />
                ))
              )}
            </Sheet>
          </>
        )}
        
        {labelsLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
            <CircularProgress size="sm" />
          </Box>
        )}
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
  const TARGET_CHAT_COUNT = 10; // Target number of matching chats to fetch
  const MAX_PAGES = 5; // Prevent infinite loops
  
  const allFetchedChats: ChatInfo[] = [];
  const existingIds = new Set(existingChats.map(c => c.chatId));
  let currentPaginationState = paginationState;
  let pagesFetched = 0;

  // Keep fetching pages until we have enough matching chats or run out of pages
  while (
    allFetchedChats.length < TARGET_CHAT_COUNT && 
    pagesFetched < MAX_PAGES
  ) {
    const newChatsRes = await twilioClient.getChats(filters.activeNumber, {
      paginationState: currentPaginationState,
      filters,
      existingChatsId: Array.from(existingIds),
    });

    const newChats = newChatsRes.chats;
    currentPaginationState = newChatsRes.paginationState;
    pagesFetched++;

    if (newChats.length === 0) {
      break; // No more chats available
    }

    // Apply unread status
    const unreads = await twilioClient.hasUnread(filters.activeNumber, newChats);
    newChats.forEach((c, i) => {
      c.hasUnread = unreads[i];
    });

    // Augment with backend data (labels, flags, etc.)
    if (newChats.length > 0) {
      try {
        const augmentations = await apiClient.getChats(
          newChats.map((c) => c.chatId),
          filters.labelIds
        );
        for (const c of newChats) {
          const found = augmentations.data.data.find((fc) => fc.chatCode === c.chatId);
          if (found) {
            c.isFlagged = found.isFlagged;
            c.flaggedReason = found.flaggedReason;
            c.flaggedMessage = found.flaggedMessage;
            c.claimedBy = found.claimedBy;
            c.enrichedData = found.enrichedData;
            c.labels = found.labels;
          }
        }
      } catch (err) {
        // Continue even if augmentation fails
      }
    }

    // Filter by labels if needed
    let chatsToAdd = newChats;
    if (filters.labelIds && filters.labelIds.length > 0) {
      chatsToAdd = newChats.filter(chat => {
        if (!chat.labels || chat.labels.length === 0) return false;
        const chatLabelIds = chat.labels.map(l => l.id);
        return filters.labelIds!.some(labelId => chatLabelIds.includes(labelId));
      });
    }

    // Add to accumulated chats (avoid duplicates)
    for (const chat of chatsToAdd) {
      if (!existingIds.has(chat.chatId)) {
        allFetchedChats.push(chat);
        existingIds.add(chat.chatId);
      }
    }

    // If no more pages available, stop
    if (!currentPaginationState?.hasMore) {
      break;
    }

    // If no labels are filtered, we can stop after one page
    if (!filters.labelIds || filters.labelIds.length === 0) {
      break;
    }
  }

  return {
    chats: allFetchedChats,
    paginationState: currentPaginationState
  };
}
