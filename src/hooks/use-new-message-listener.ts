import { useEffect } from "react";
import { useAuthedTwilio } from "../context/TwilioProvider";
import type { ChatInfo } from "../types";
import { makeChatId } from "../utils";
import { apiClient } from "../api-client";

export function useNewMessageListener(
    activePhoneNumber: string,
    setChats: (
        updater: ((prevChats: ChatInfo[]) => ChatInfo[]) | ChatInfo[],
    ) => void,
) {
    const { eventEmitter } = useAuthedTwilio();

    useEffect(() => {
        const subId = eventEmitter.on("new-message", async (msg) => {
            if (
                (msg.direction === "inbound" ? msg.to : msg.from) !==
                activePhoneNumber
            )
                return;
            const contactNumber =
                msg.direction === "inbound" ? msg.from : msg.to;
            const chatId = makeChatId(activePhoneNumber, contactNumber);

            const newChat: ChatInfo = {
                chatId,
                contactNumber,
                activeNumber: activePhoneNumber,
                recentMsgContent: msg.content,
                recentMsgDate: new Date(msg.timestamp),
                recentMsgId: msg.id,
                recentMsgDirection: msg.direction,
            };

            try {
                const augmentations = await apiClient.getChats({ chatsOfInterest: [chatId] });
                const match = augmentations.data.data.find(
                    (e) => e.chatCode === chatId,
                );
                if (match) {
                    Object.assign(newChat, match);
                }
            } catch {}

            setChats((prev) => {
                const index = prev.findIndex((c) => c.chatId === chatId);
                if (index >= 0) {
                    const updated = [...prev];
                    newChat.hasUnread =
                        msg.direction === "inbound"
                            ? true
                            : updated[index].hasUnread;
                    updated[index] = { ...updated[index], ...newChat };
                    return updated;
                }

                newChat.hasUnread = msg.direction === "inbound" ? true : false;
                return [...prev, newChat];
            });

            if (window.Notification?.permission === "granted") {
                new Notification(`New message`, {
                    body: msg.content,
                    icon: "/logo.png",
                });
            }

            // Ask for notification permission
            // window.Notification?.requestPermission();
        });

        return () => eventEmitter.off(subId);
    }, [activePhoneNumber]);
}
