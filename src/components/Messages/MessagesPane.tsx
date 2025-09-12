import { Box, Sheet, Stack, Avatar } from "@mui/joy";

import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import MessagesPaneHeader from "./MessagesPaneHeader";
import { useAuthedTwilio } from "../../context/TwilioProvider";

import type { ChatInfo } from "../../types";
import { useChatMessages } from "../../hooks/use-messages";
import { useAuth } from "../../hooks/use-auth";

type MessagesPaneProps = {
  chat: ChatInfo;
};

export default function MessagesPane(props: MessagesPaneProps) {
  const { chat } = props;
  const { twilioClient, eventEmitter } = useAuthedTwilio();
  const { messages } = useChatMessages(chat);
  const { userEmail } = useAuth();

  return (
    <Sheet
      sx={{
        height: { xs: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.level1",
      }}
    >
      <MessagesPaneHeader chat={chat} />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          px: 2,
          py: 3,
          overflowY: "scroll",
          flexDirection: "column-reverse",
        }}
      >
        <Stack spacing={2} sx={{ justifyContent: "flex-end" }}>
          {messages.map((message, index) => {
            const isYou = message.direction === "outbound";
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                sx={{ flexDirection: isYou ? "row-reverse" : "row" }}
              >
                {!isYou && <Avatar />}
                <ChatBubble {...message} />
              </Stack>
            );
          })}
        </Stack>
      </Box>
      <MessageInput
        disabled={!!chat.claimedBy && chat.claimedBy !== userEmail}
        onSubmit={async (content) => {
          try {
            await twilioClient.sendMessage(
              chat.activeNumber,
              chat.contactNumber,
              content,
            );
            await eventEmitter.checkForNewMessage();
          } catch (err) {
            console.error("Erroring sending text message:", err);
          }
        }}
      />
    </Sheet>
  );
}
