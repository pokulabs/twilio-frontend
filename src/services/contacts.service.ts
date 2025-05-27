import { makeChatId } from "../utils.ts";
import TwilioRawClient from "./twilio-raw-client.ts";
import { storage } from "../storage.ts";

import type { ChatInfo, TwilioMsg } from "../types.ts";

export class ContactsService {
    private client: TwilioRawClient;
    private paginators:
        | {
              inbound: Awaited<ReturnType<TwilioRawClient["getMessages"]>>;
              outbound: Awaited<ReturnType<TwilioRawClient["getMessages"]>>;
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

        const chatId = makeChatId(activeNumber, contactNumber);

        const moreRecentMsg =
            outbound.items[0]?.dateSent > inbound.items[0]?.dateSent
                ? outbound.items[0]
                : inbound.items[0];

        return {
            chatId: chatId,
            contactNumber: contactNumber,
            recentMsgId: moreRecentMsg.sid,
            recentMsgDate: moreRecentMsg.dateSent,
            recentMsgContent: moreRecentMsg.body,
            hasUnread:
                moreRecentMsg.sid === this.getMostRecentMsgSeen(chatId)
                    ? false
                    : true,
        };
    }

    async getChats(
        activeNumber: string,
        {
            loadMore = false,
            existingChatsId = [],
            chatsPageSize = 2,
        }: {
            loadMore?: boolean;
            existingChatsId?: string[];
            chatsPageSize?: number;
        },
    ): Promise<ChatInfo[]> {
        if (!loadMore) {
            return this.first(activeNumber);
        }

        const chats = new Map<string, ChatInfo>();

        // Load more call — paginate to get next batch of N chats without gaps
        if (!this.paginators) {
            throw new Error(
                "Must call with loadMore=false at least once before loadMore=true.",
            );
        }

        let inboundPage = this.paginators.inbound;
        let outboundPage = this.paginators.outbound;

        while (chats.size < chatsPageSize) {
            // If inbound has been fully processed
            if (
                this.globalEarliestEnder?.getTime() ===
                inboundPage.items.at(-1)?.dateSent.getTime()
            ) {
                const hasMoreInbound = inboundPage.hasNextPage();
                if (hasMoreInbound) {
                    inboundPage = await inboundPage.getNextPage();
                }
            }

            if (
                this.globalEarliestEnder?.getTime() ===
                outboundPage.items.at(-1)?.dateSent.getTime()
            ) {
                const hasMoreoutbound = outboundPage.hasNextPage();
                if (hasMoreoutbound) {
                    outboundPage = await outboundPage.getNextPage();
                }
            }

            let temp = this.getPointer(inboundPage.items, outboundPage.items);

            // Merge filtered messages
            const merged = this.mergeTwoSortedArrays(
                inboundPage.items.filter(
                    (m) => m.dateSent < this.globalEarliestEnder!,
                ),
                outboundPage.items.filter(
                    (m) => m.dateSent < this.globalEarliestEnder!,
                ),
                temp,
            );

            for (const m of merged) {
                const contactNumber = m.direction === "inbound" ? m.from : m.to;
                const chatId = makeChatId(activeNumber, contactNumber);
                if (chats.has(chatId) || existingChatsId.includes(chatId)) {
                    continue;
                }
                chats.set(chatId, {
                    chatId,
                    contactNumber,
                    recentMsgId: m.sid,
                    recentMsgDate: m.dateSent,
                    recentMsgContent: m.body,
                    hasUnread: m.sid !== this.getMostRecentMsgSeen(chatId),
                });

                if (chats.size >= chatsPageSize) {
                    // Ended early so back up the pointer (make more recent in the array)
                    temp = m.dateSent;
                    break;
                }
            }

            // Update pointers
            this.globalEarliestEnder = temp;

            this.paginators = {
                inbound: inboundPage,
                outbound: outboundPage,
            };
        }

        console.log([...chats.values()]);

        return [...chats.values()];
    }

    private async first(activeNumber: string) {
        const chats = new Map<string, ChatInfo>();

        // First call — just get the first pages of both
        const [outbound, inbound] = await Promise.all([
            this.client.getMessages({ from: activeNumber }),
            this.client.getMessages({ to: activeNumber }),
        ]);

        this.paginators = { outbound, inbound };
        this.globalEarliestEnder = this.getPointer(
            inbound.items,
            outbound.items,
        );

        // Merge and slice just enough
        const merged = this.mergeTwoSortedArrays(
            inbound.items,
            outbound.items,
            this.globalEarliestEnder,
        );

        for (const m of merged) {
            const contactNumber = m.direction === "inbound" ? m.from : m.to;
            const chatId = makeChatId(activeNumber, contactNumber);
            if (chats.has(chatId)) {
                continue;
            }

            chats.set(chatId, {
                chatId,
                contactNumber,
                recentMsgId: m.sid,
                recentMsgDate: m.dateSent,
                recentMsgContent: m.body,
                hasUnread: m.sid !== this.getMostRecentMsgSeen(chatId),
            });
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

    private getPointer(inbound: TwilioMsg[], outbound: TwilioMsg[]) {
        const oldestInboundDate = inbound.at(-1)?.dateSent;
        const oldestOutboundDate = outbound.at(-1)?.dateSent;

        const dates = [oldestInboundDate, oldestOutboundDate].filter(
            Boolean,
        ) as Date[];
        return new Date(Math.max(...dates.map((d) => d.getTime())));
    }

    private getMostRecentMsgSeen(chatId: string) {
        return storage.get("mostRecentMessageSeenPerChat")[chatId];
    }

    private mergeTwoSortedArrays(
        inbound: TwilioMsg[],
        outbound: TwilioMsg[],
        oldestAllowedDate?: Date,
    ) {
        const full: TwilioMsg[] = [];
        const filteredInbound = oldestAllowedDate
            ? inbound.filter((msg) => msg.dateSent >= oldestAllowedDate)
            : inbound;

        const filteredOutbound = oldestAllowedDate
            ? outbound.filter((msg) => msg.dateSent >= oldestAllowedDate)
            : outbound;

        let i = 0;
        let j = 0;

        while (i < filteredInbound.length && j < filteredOutbound.length) {
            if (filteredInbound[i].dateSent > filteredOutbound[j].dateSent) {
                full.push(filteredInbound[i++]);
            } else {
                full.push(filteredOutbound[j++]);
            }
        }

        while (i < filteredInbound.length) {
            full.push(filteredInbound[i++]);
        }

        while (j < filteredOutbound.length) {
            full.push(filteredOutbound[j++]);
        }

        return full;
    }
}
