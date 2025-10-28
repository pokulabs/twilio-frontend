import { useEffect, useState } from "react";
import type { ChatInfo, PlainMessage } from "../types/types";
import { useAuthedTwilio } from "../context/TwilioProvider";

export function useChatMessages(chat: ChatInfo) {
    const { twilioClient, eventEmitter } = useAuthedTwilio();
    const [messages, setMessages] = useState<PlainMessage[]>([]);

    useEffect(() => {
        if (!chat.chatId) return;

        const fetchMessages = async () => {
            try {
                const messages = await twilioClient.getMessages(
                    chat.activeNumber,
                    chat.contactNumber,
                );
                setMessages(messages);
                twilioClient.updateMostRecentlySeenMessageId(
                    chat.chatId,
                    messages,
                );
            } catch (err) {
                console.error("Failed to fetch chat messages:", err);
            }
        };

        const handleNewMessage = (msg: PlainMessage) => {
            const newMsgContact =
                msg.from === chat.activeNumber ? msg.to : msg.from;
            if (newMsgContact !== chat.contactNumber) return;

            setMessages((prev) => {
                const lastMsg = prev.at(-1);
                return lastMsg?.id === msg.id
                    ? [...prev.slice(0, -1), msg] // overwrite last msg
                    : [...prev, msg]; // append
            });
        };

        fetchMessages();
        const subId = eventEmitter.on("new-message", handleNewMessage);
        return () => eventEmitter.off(subId);
    }, [chat.chatId]);

    return { messages };
}
