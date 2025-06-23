import React, { useMemo } from "react";
import { Box, Sheet, Stack, Avatar } from "@mui/joy";

import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import MessagesPaneHeader from "./MessagesPaneHeader";
import { useAuthedTwilio } from "../../context/TwilioProvider";

import type { ChatInfo, PlainMessage } from "../../types";

type MessagesPaneProps = {
  chat: ChatInfo;
};

export default function MessagesPane(props: MessagesPaneProps) {
  const { chat } = props;
  const { twilioClient, eventEmitter } = useAuthedTwilio();
  const [chatMessages, setChatMessages] = React.useState<PlainMessage[]>([]);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const msgs = await twilioClient.getMessages(
          chat.activeNumber,
          chat.contactNumber,
        );
        setChatMessages(msgs);
        twilioClient.updateMostRecentlySeenMessageId(chat.chatId, msgs);
      } catch (err) {
        console.error("Failed to fetch chat messages:", err);
      }
    };

    fetch();

    const subId = eventEmitter.on("new-message", (msg) => {
      const newMsgContactNumber =
        msg.from === chat.activeNumber ? msg.to : msg.from;
      if (newMsgContactNumber === chat.contactNumber) {
        setChatMessages((prevMsgs) => {
          if (prevMsgs.at(-1)?.id === msg.id) {
            // Overwrite the last message
            return [...prevMsgs.slice(0, -1), msg];
          }
          // Append the new message
          return [...prevMsgs, msg];
        });
      }
    });

    return () => eventEmitter.off(subId);
  }, [chat.chatId]);

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
          {chatMessages.map((message, index) => {
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
