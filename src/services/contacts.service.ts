import { makeChatId } from "../utils.ts";
import TwilioRawClient from "./twilio-raw-client.ts";
import { storage } from "../storage.ts";

import type { ChatInfo, TwilioMsg } from "../types.ts";

type MessagePaginator = Awaited<ReturnType<TwilioRawClient["getMessages"]>>;

interface GetChatsOptions {
    loadMore?: boolean;
    existingChatsId?: string[];
    chatsPageSize?: number;
}

export class ContactsService {
    private client: TwilioRawClient;
    private paginators:
        | {
              inbound: MessagePaginator;
              outbound: MessagePaginator;
          }
        | undefined;
    private globalEarliestEnder: Date | undefined;

    constructor(client: TwilioRawClient) {
        this.client = client;
    }

    async getChat(
        activeNumber: string,
        contactNumber: string,
    ): Promise<ChatInfo | undefined> {
        const [outbound, inbound] = await Promise.all([
            this.client.getMessages({
                from: activeNumber,
                to: contactNumber,
                limit: 1,
            }),
            this.client.getMessages({
                from: contactNumber,
                to: activeNumber,
                limit: 1,
            }),
        ]);

        if (!outbound.items.length && !inbound.items.length) {
            return;
        }

        const moreRecentMsg = this.getMostRecentMessage(
            outbound.items[0],
            inbound.items[0],
        );
        return this.createChatInfo(activeNumber, moreRecentMsg);
    }

    async getChats(
        activeNumber: string,
        {
            loadMore = false,
            existingChatsId = [],
            chatsPageSize = 10,
        }: GetChatsOptions,
    ): Promise<ChatInfo[]> {
        if (!loadMore) {
            return this.initializeChats(activeNumber);
        }

        const chats = new Map<string, ChatInfo>();

        // Load more call — paginate to get next batch of N chats without gaps
        if (!this.paginators) {
            throw new Error(
                "Must call with loadMore=false at least once before loadMore=true.",
            );
        }

        let { inbound, outbound } = this.paginators;

        while (chats.size < chatsPageSize) {
            inbound = await this.tryAdvancePaginator(inbound);
            outbound = await this.tryAdvancePaginator(outbound);

            let cutoffDate = this.getMostRecentMessage(
                inbound.items.at(-1),
                outbound.items.at(-1),
            ).dateSent;

            // Merge filtered messages
            const merged = this.mergeSortedMessages(
                inbound.items.filter(
                    (m) => m.dateSent < this.globalEarliestEnder!,
                ),
                outbound.items.filter(
                    (m) => m.dateSent < this.globalEarliestEnder!,
                ),
                cutoffDate,
            );

            // If no messages to process and no more pages, break out
            if (
                merged.length === 0 &&
                !inbound.hasNextPage() &&
                !outbound.hasNextPage()
            ) {
                break;
            }

            for (const m of merged) {
                const chatInfo = this.createChatInfo(activeNumber, m);
                if (
                    chats.has(chatInfo.chatId) ||
                    existingChatsId.includes(chatInfo.chatId)
                ) {
                    continue;
                }
                chats.set(chatInfo.chatId, chatInfo);

                if (chats.size >= chatsPageSize) {
                    // Ended early so back up the pointer (make more recent in the array)
                    cutoffDate = m.dateSent;
                    break;
                }
            }

            // Update pointers
            this.globalEarliestEnder = cutoffDate;

            this.paginators = {
                inbound,
                outbound,
            };
        }

        return [...chats.values()];
    }

    private async initializeChats(activeNumber: string) {
        const chats = new Map<string, ChatInfo>();

        // First call — just get the first pages of both
        const [outbound, inbound] = await Promise.all([
            this.client.getMessages({ from: activeNumber }),
            this.client.getMessages({ to: activeNumber }),
        ]);

        this.paginators = { outbound, inbound };
        this.globalEarliestEnder = this.getMostRecentMessage(
            inbound.items.at(-1),
            outbound.items.at(-1),
        ).dateSent;

        // Merge and slice just enough
        const merged = this.mergeSortedMessages(
            inbound.items,
            outbound.items,
            this.globalEarliestEnder,
        );

        for (const m of merged) {
            const chatInfo = this.createChatInfo(activeNumber, m);
            if (chats.has(chatInfo.chatId)) {
                continue;
            }
            chats.set(chatInfo.chatId, chatInfo);
        }

        return [...chats.values()];
    }

    hasMoreChats() {
        return !!(
            this.paginators?.outbound.hasNextPage() ||
            this.paginators?.inbound.hasNextPage()
        );
    }

    updateMostRecentlySeenMessageId(chatId: string, messageId: string) {
        storage.updateMostRecentlySeenMessageId(chatId, messageId);
    }

    private getMostRecentMsgSeen(chatId: string) {
        return storage.get("mostRecentMessageSeenPerChat")[chatId];
    }

    private createChatInfo(activeNumber: string, message: TwilioMsg): ChatInfo {
        const contactNumber =
            message.direction === "inbound" ? message.from : message.to;
        const chatId = makeChatId(activeNumber, contactNumber);

        return {
            chatId,
            contactNumber,
            recentMsgId: message.sid,
            recentMsgDate: message.dateSent,
            recentMsgContent: message.body,
            hasUnread: message.sid !== this.getMostRecentMsgSeen(chatId),
        };
    }

    private getMostRecentMessage(
        outboundMsg?: TwilioMsg,
        inboundMsg?: TwilioMsg,
    ): TwilioMsg {
        if (!outboundMsg) return inboundMsg!;
        if (!inboundMsg) return outboundMsg;

        return outboundMsg.dateSent > inboundMsg.dateSent
            ? outboundMsg
            : inboundMsg;
    }

    private mergeSortedMessages(
        inbound: TwilioMsg[],
        outbound: TwilioMsg[],
        oldestAllowedDate?: Date,
    ): TwilioMsg[] {
        const filteredInbound = oldestAllowedDate
            ? inbound.filter((msg) => msg.dateSent >= oldestAllowedDate)
            : inbound;

        const filteredOutbound = oldestAllowedDate
            ? outbound.filter((msg) => msg.dateSent >= oldestAllowedDate)
            : outbound;

        const result: TwilioMsg[] = [];
        let i = 0;
        let j = 0;

        // Merge while both arrays have elements
        while (i < filteredInbound.length && j < filteredOutbound.length) {
            if (filteredInbound[i].dateSent > filteredOutbound[j].dateSent) {
                result.push(filteredInbound[i++]);
            } else {
                result.push(filteredOutbound[j++]);
            }
        }

        // Add remaining elements
        result.push(...filteredInbound.slice(i), ...filteredOutbound.slice(j));

        return result;
    }

    private async tryAdvancePaginator(paginator: MessagePaginator) {
        const lastMessage = paginator.items.at(-1);
        if (
            !lastMessage ||
            this.globalEarliestEnder?.getTime() !==
                lastMessage.dateSent.getTime()
        ) {
            return paginator;
        }

        return paginator.hasNextPage()
            ? await paginator.getNextPage()
            : paginator;
    }
}
