import {
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  Typography,
  Avatar,
} from "@mui/joy";
import { BackHand, Circle } from "@mui/icons-material";

import { displayDynamicDateTime, toggleMessagesPane } from "../../utils";

import type { ChatInfo } from "../../types";
import { useAuth } from "../../hooks/use-auth";
type ChatListItemProps = ListItemButtonProps & {
  chat: ChatInfo;
  isSelected: boolean;
  onChatSelected: (chat: ChatInfo) => void;
};

export default function ChatListItem(props: ChatListItemProps) {
  const { chat, isSelected, onChatSelected } = props;
  const { userEmail } = useAuth();
  return (
    <>
      <ListItem>
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            onChatSelected(chat);
          }}
          selected={isSelected}
          color="neutral"
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            border: 0,
            borderLeft: "4px solid",
            borderLeftColor: chat.isFlagged
              ? "var(--joy-palette-warning-400)"
              : "transparent",
          }}
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
              <Typography level="title-sm">
                {chat.enrichedData?.displayName || chat.contactNumber}
              </Typography>
              <Typography level="body-xs" noWrap>
                {displayDynamicDateTime(chat.recentMsgDate)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0}
              alignItems="center"
              justifyContent="space-between"
            >

              <Typography
                level="body-sm"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "1",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  overflowWrap: "break-word", // Handles long words
                  wordBreak: "break-word", // Extra safety for long strings like URLs
                }}
              >
                {chat.recentMsgContent}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {chat.claimedBy && (
                  <BackHand
                    sx={{ fontSize: 16 }}
                    titleAccess={chat.claimedBy}
                    color={chat.claimedBy === userEmail ? "success" : "info"}
                  />
                )}
                {chat.labels?.map((e) => (
                  <Circle
                    key={e.name}
                    sx={{ fontSize: 10, color: e.color }}
                    titleAccess={e.name}
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </>
  );
}
