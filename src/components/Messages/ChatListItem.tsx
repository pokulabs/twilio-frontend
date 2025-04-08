import * as React from "react";
import {
  Box,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  Typography,
  Avatar,
} from "@mui/joy";
import { Circle } from "@mui/icons-material";

import { displayDateTime, toggleMessagesPane } from "../../utils";

import type { ChatInfo } from "../../types";

type ChatListItemProps = ListItemButtonProps & {
  chat: ChatInfo;
  selectedChatId?: string;
  setSelectedChat: (chat: ChatInfo) => void;
};

export default function ChatListItem(props: ChatListItemProps) {
  const { chat, selectedChatId, setSelectedChat } = props;
  const selected = selectedChatId === chat.chatId;
  return (
    <>
      <ListItem>
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            setSelectedChat(chat);
          }}
          selected={selected}
          color="neutral"
          sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}
        >
          <Circle
            sx={{
              fontSize: 10,
              visibility: chat.hasUnread ? "visible" : "hidden",
              alignSelf: "center",
            }}
            color="primary"
          />
          <Avatar />
          <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
            <Stack
              direction="row"
              spacing={0}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography level="title-sm">{chat.contactNumber}</Typography>
              <Typography
                level="body-xs"
                noWrap
                sx={{ display: { xs: "none", md: "block" } }}
              >
                {displayDateTime(chat.recentMsgDate)}
              </Typography>
            </Stack>
            <Typography
              level="body-sm"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {chat.recentMsgContent}
            </Typography>
          </Stack>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </>
  );
}
