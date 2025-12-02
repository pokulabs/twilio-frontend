import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Stack,
  Avatar,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Card,
  Divider,
  Alert,
  InputAdornment
} from "@mui/material";
import { CreateTextField } from "../shared/CreateTextField";
import { SendRounded, PhoneRounded } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import ChatBubble from "../Messages/ChatBubble";
import type { PlainMessage } from "../../types/types";
import CreateButton from "../shared/CreateButton";

interface DemoMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export default function TryIt() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: "1",
      content: `Howdy!
        1. Enter your phone number above
        2. Start chatting. E.g. "What are the best destinations for a vacation home?"
        3. Ask to speak to a human. E.g. "Is a human available to chat about this?"
        4. Check your texts and reply!`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: DemoMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Exclude the starting ("Howdy!") message
      // Only build "previous conversation" context if there's more than just the current user message being sent
      const conversationHistory = updatedMessages.slice(1); // Skip the first message always
      let conversationContext = `<CurrentMessage>${message}</CurrentMessage>`;

      if (conversationHistory.length > 1) {
        // Keep only the last 10 (excluding starter) to avoid token bloat
        const recentMessages = conversationHistory.slice(-10);
        const previousMessagesXml = recentMessages
          .map(
            (msg) =>
              `<Message role="${msg.isBot ? "Assistant" : "User"}">${msg.content}</Message>`,
          )
          .join("");
        conversationContext += `<PreviousConversation>${previousMessagesXml}</PreviousConversation>`;
      }

      const response = await apiClient.sendDemoMessage(
        conversationContext,
        phoneNumber,
      );

      const botMessage: DemoMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);

      let friendlyMessage = "Sorry, I encountered an error. Please try again.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) {
          friendlyMessage =
            "You've reached the weekly limit of playground messages. Please try again next week.";
        }
      }

      setError(friendlyMessage);

      const errorMessage: DemoMessage = {
        id: (Date.now() + 1).toString(),
        content: friendlyMessage,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        mx: "auto",
        mt: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ pb: 3 }}>
        <FormControl>
          <FormLabel sx={{color: "text.primary", fontSize: "small"}}>Enter Your Phone Number</FormLabel>
          <CreateTextField
            placeholder="+12223334444"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            sx={{ width: 300, maxWidth: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRounded color="action" />
                  </InputAdornment>
                )
              }
            }}
          />
        </FormControl>
      </Box>

      <Card
        sx={{
          display: "flex",
          minHeight: 300,
          maxHeight: 700,
          height: "60vh",
          flexDirection: "column",
          backgroundColor: "grey.100",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.map((msg) => {
            const plainMessage: PlainMessage = {
              id: msg.id,
              content: msg.content,
              timestamp: msg.timestamp.getTime(),
              direction: msg.isBot ? "inbound" : "outbound",
              from: msg.isBot ? "bot" : "user",
              to: msg.isBot ? "user" : "bot",
              status: "delivered",
              errorCode: 0,
            };

            return (
              <Stack
                key={msg.id}
                direction="row"
                spacing={2}
                sx={{
                  flexDirection: msg.isBot ? "row" : "row-reverse",
                  alignItems: "flex-start",
                }}
              >
                {msg.isBot && <Avatar />}
                <ChatBubble {...plainMessage} />
              </Stack>
            );
          })}
          {isLoading && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "flex-start" }}
            >
              <Avatar />
              <ChatBubble
                id="loading"
                content="Bot is thinking..."
                timestamp={Date.now()}
                direction="inbound"
                from="bot"
                to="user"
                status="delivered"
                errorCode={0}
              />
            </Stack>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={1} direction="row">
            <CreateTextField
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading || !phoneNumber.trim()}
              sx={{ flexGrow: 1 }}
            />
            <CreateButton
              color="primary"
              variant="contained"
              onCreate={sendMessage}
              disabled={!message.trim() || isLoading || !phoneNumber.trim()}
              loading={isLoading}
              sx={{textTransform: "none"}}
            >
              <Typography variant="body2" sx={{mr: 1, fontWeight: 600}}>Send</Typography> <SendRounded />
            </CreateButton>
          </Stack>
          <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
            Press Cmd/Ctrl + Enter to send
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
