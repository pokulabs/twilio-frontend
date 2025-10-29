import { makeChatId, parseChatId } from "../utils.ts";
import TwilioRawClient from "./twilio-raw-client.ts";
import { storage } from "../storage.ts";

import type { ChatInfo, PlainMessage, TwilioMsg } from "../types/types.ts";

type MessagePaginator = Awaited<ReturnType<TwilioRawClient["getMessages"]>>;

export type PaginationState = {
    paginators: { inbound: MessagePaginator; outbound: MessagePaginator };
    globalEarliestEnder: Date | undefined;
    hasMore: boolean;
};

export type GetChatsOptions = {
    existingChatsId?: string[];
    chatsPageSize?: number;
    onlyUnread?: boolean;
    paginationState?: PaginationState;
};

export type Filters = {
    search?: string;
    onlyUnread?: boolean;
    activeNumber: string;
    labelIds?: string[];
};

type GetChatsResult = {
    chats: ChatInfo[];
    paginationState?: PaginationState;
};

export class ContactsService {
    private client: TwilioRawClient;

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

    getChatsByIds(chatIds: string[]) {
        return Promise.all(
            chatIds.map((chatId) => {
                const { activeNumber, contactNumber } = parseChatId(chatId);
                return this.getChat(activeNumber, contactNumber);
            }),
        );
    }

    async getChats(
        activeNumber: string,
        { existingChatsId = [], chatsPageSize = 10, ...opts }: GetChatsOptions,
    ): Promise<GetChatsResult> {
        const chats = new Map<string, ChatInfo>();
        const processedForUnread = new Set<string>();
        let isFirstRun = false;

        let paginators = opts.paginationState
            ? opts.paginationState.paginators
            : undefined;
        let globalEarliestEnder = opts.paginationState
            ? opts.paginationState.globalEarliestEnder
            : undefined;

        // First-time call: initialize paginators
        if (!paginators || !globalEarliestEnder) {
            const [outbound, inbound] = await Promise.all([
                this.client.getMessages({ from: activeNumber }),
                this.client.getMessages({ to: activeNumber }),
            ]);

            paginators = { outbound, inbound };

            // If no chats on this activeNumber
            if (!outbound.items.length && !inbound.items.length) {
                return {
                    chats: [],
                    paginationState: {
                        paginators,
                        globalEarliestEnder: undefined,
                        hasMore: false,
                    },
                };
            }

            isFirstRun = true;
            globalEarliestEnder = this.getMostRecentMessage(
                inbound.items.at(-1),
                outbound.items.at(-1),
            ).dateSent;
        }

        while (chats.size < chatsPageSize) {
            const newlyAddedChats = new Map<string, ChatInfo>();

            let cutoffDate = this.getMostRecentMessage(
                paginators.inbound.items.at(-1),
                paginators.outbound.items.at(-1),
            ).dateSent;

            const merged = this.mergeSortedMessages(
                paginators.inbound.items,
                paginators.outbound.items,
                cutoffDate,
                // Don't filter for before on firstRun
                isFirstRun ? new Date() : globalEarliestEnder,
            );

            // If no messages to process and no more pages, break out
            if (
                merged.length === 0 &&
                !paginators.inbound.hasNextPage() &&
                !paginators.outbound.hasNextPage()
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
                newlyAddedChats.set(chatInfo.chatId, chatInfo);

                if (chats.size >= chatsPageSize) {
                    // Ended early so back up the pointer (make more recent in the array)
                    cutoffDate = m.dateSent;
                    break;
                }
            }

            if (opts.onlyUnread) {
                const unread = await this.filterToUnread(
                    activeNumber,
                    newlyAddedChats,
                );

                for (const chatId of newlyAddedChats.keys()) {
                    processedForUnread.add(chatId);

                    if (!unread.has(chatId)) {
                        chats.delete(chatId);
                    }
                }
            }

            // Update pointers
            globalEarliestEnder = cutoffDate;

            [paginators.outbound, paginators.inbound] = await Promise.all([
                this.tryAdvancePaginator(
                    paginators.inbound,
                    globalEarliestEnder,
                ),
                this.tryAdvancePaginator(
                    paginators.outbound,
                    globalEarliestEnder,
                ),
            ]);

            isFirstRun = false;
        }

        return {
            chats: [...chats.values()],
            paginationState: {
                paginators,
                globalEarliestEnder,
                hasMore: this.hasMoreChats(paginators, globalEarliestEnder),
            },
        };
    }

    private hasMoreChats(
        paginators: PaginationState["paginators"] | undefined,
        globalEarliestEnder: Date | undefined,
    ) {
        if (!paginators || !globalEarliestEnder) return false;

        const { inbound, outbound } = paginators;

        let cutoffDate = this.getMostRecentMessage(
            inbound.items.at(-1),
            outbound.items.at(-1),
        ).dateSent;

        return !!(
            cutoffDate.getTime() !== globalEarliestEnder.getTime() ||
            inbound.hasNextPage() ||
            outbound.hasNextPage()
        );
    }

    updateMostRecentlySeenMessageId(chatId: string, msgs: PlainMessage[]) {
        // Take advantage of known sort order, oldest to newest
        const mostRecentInboundMsg = msgs
            .slice()
            .reverse()
            .find((m) => m.direction === "inbound");
        if (mostRecentInboundMsg) {
            storage.updateMostRecentlySeenMessageId(
                chatId,
                mostRecentInboundMsg.id,
            );
        }
    }

    hasUnread(activeNumber: string, chats: ChatInfo[]) {
        return Promise.all(
            chats.map(async (c) => {
                const lastInboundMsgId = storage.get(
                    "mostRecentMessageSeenPerChat",
                )[c.chatId];
                const msgs = await this.client.getMessages({
                    from: c.contactNumber,
                    to: activeNumber,
                });
                // Take advantage of the known sort order, most recent to least
                const earliestInboundMsg = msgs.items.find(
                    (m) => m.direction === "inbound",
                );
                if (!earliestInboundMsg) {
                    return false;
                }

                return earliestInboundMsg.sid !== lastInboundMsgId;
            }),
        );
    }

    private async filterToUnread(
        activeNumber: string,
        chats: Map<string, ChatInfo>,
    ) {
        const unread = await this.hasUnread(activeNumber, [...chats.values()]);

        const filtered = new Map<string, ChatInfo>();
        [...chats.values()].forEach((c, i) => {
            if (unread[i]) {
                filtered.set(c.chatId, c);
            }
        });

        return filtered;
    }

    private createChatInfo(activeNumber: string, message: TwilioMsg): ChatInfo {
        const contactNumber =
            message.direction === "inbound" ? message.from : message.to;
        const chatId = makeChatId(activeNumber, contactNumber);

        return {
            chatId,
            contactNumber,
            activeNumber,
            recentMsgId: message.sid,
            recentMsgDate: message.dateSent,
            recentMsgContent: message.body,
            recentMsgDirection:
                message.direction === "inbound" ? "inbound" : "outbound",
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
        afterDate: Date,
        beforeDate: Date,
    ): TwilioMsg[] {
        const filteredInbound = inbound
            .filter((msg) => msg.dateSent >= afterDate)
            .filter((msg) => msg.dateSent < beforeDate);
        const filteredOutbound = outbound
            .filter((msg) => msg.dateSent >= afterDate)
            .filter((msg) => msg.dateSent < beforeDate);

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

    private async tryAdvancePaginator(
        paginator: MessagePaginator,
        globalEarliestEnder: Date,
    ) {
        const lastMessage = paginator.items.at(-1);
        if (
            !lastMessage ||
            globalEarliestEnder?.getTime() !== lastMessage.dateSent.getTime()
        ) {
            return paginator;
        }

        return paginator.hasNextPage()
            ? await paginator.getNextPage()
            : paginator;
    }
}
