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

    constructor(client: TwilioRawClient) {
        this.client = client;
    }

    async getChat(activeNumber: string, contactNumber: string) {
        const arr: ChatInfo[] = [];
        const [outbound, inbound] = await Promise.all([
            this.client.getMessages({ from: activeNumber, to: contactNumber }),
            this.client.getMessages({ from: contactNumber, to: activeNumber }),
        ]);

        if (!outbound.items.length && !inbound.items.length) {
            return [];
        }

        const chatId = makeChatId(activeNumber, contactNumber);

        const moreRecentMsg =
            outbound.items[0]?.dateSent > inbound.items[0]?.dateSent
                ? outbound.items[0]
                : inbound.items[0];

        arr.push({
            chatId: chatId,
            contactNumber: contactNumber,
            recentMsgId: moreRecentMsg.sid,
            recentMsgDate: moreRecentMsg.dateSent,
            recentMsgContent: moreRecentMsg.body,
            hasUnread:
                moreRecentMsg.sid === this.getMostRecentMsgSeen(chatId)
                    ? false
                    : true,
        });

        return arr;
    }

    async getChats(activeNumber: string, loadMore = false) {
        const knownContacts = new Set<string>();
        const arr: ChatInfo[] = [];

        // Try to get the next pages
        if (loadMore) {
            if (!this.paginators) {
                throw new Error(
                    "Can only call loadMore=true after calling loadMore=false at least once.",
                );
            }
            if (!this.hasMoreChats()) {
                throw new Error("No more chats to load.");
            }

            // Only fetch next pages for paginators that have more data
            const outboundPromise = this.paginators.outbound.hasNextPage()
                ? this.paginators.outbound.getNextPage()
                : this.paginators.outbound;

            const inboundPromise = this.paginators.inbound.hasNextPage()
                ? this.paginators.inbound.getNextPage()
                : this.paginators.inbound;

            const [outbound, inbound] = await Promise.all([
                outboundPromise,
                inboundPromise,
            ]);

            this.paginators = {
                inbound: inbound,
                outbound: outbound,
            };
        } else {
            // Otherwise, get the first page
            const [outbound, inbound] = await Promise.all([
                this.client.getMessages({ from: activeNumber }),
                this.client.getMessages({ to: activeNumber }),
            ]);

            this.paginators = {
                inbound: inbound,
                outbound: outbound,
            };
        }

        const full = this.mergeTwoSortedArrays(
            this.paginators.inbound.items,
            this.paginators.outbound.items,
        );

        /**
         * Results are sorted by the DateSent field, with the most recent messages appearing first.
         */
        for (const m of full) {
            const contactNumber = m.direction === "inbound" ? m.from : m.to;
            if (!knownContacts.has(contactNumber)) {
                const chatId = makeChatId(activeNumber, contactNumber);
                arr.push({
                    chatId: chatId,
                    contactNumber: contactNumber,
                    recentMsgId: m.sid,
                    recentMsgDate: m.dateSent,
                    recentMsgContent: m.body,
                    hasUnread:
                        m.sid === this.getMostRecentMsgSeen(chatId)
                            ? false
                            : true,
                });
            }
            knownContacts.add(contactNumber);
        }

        return arr;
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

    private mergeTwoSortedArrays(inbound: TwilioMsg[], outbound: TwilioMsg[]) {
        const full: TwilioMsg[] = [];
        let inboundPointer = 0;
        let outboundPointer = 0;
        while (
            inboundPointer < inbound.length &&
            outboundPointer < outbound.length
        ) {
            if (
                inbound[inboundPointer].dateSent >
                outbound[outboundPointer].dateSent
            ) {
                full.push(inbound[inboundPointer]);
                inboundPointer++;
            } else {
                full.push(outbound[outboundPointer]);
                outboundPointer++;
            }
        }
        while (inboundPointer < inbound.length) {
            full.push(inbound[inboundPointer]);
            inboundPointer++;
        }
        while (outboundPointer < outbound.length) {
            full.push(outbound[outboundPointer]);
            outboundPointer++;
        }

        return full;
    }
}
