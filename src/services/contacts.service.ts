import { makeChatId } from "../utils.ts";
import TwilioRawClient from "./twilio-raw-client.ts";
import { storage } from "../storage.ts";

import type { ChatInfo, TwilioMsg } from "../types.ts";

export class ContactsService {
    private client: TwilioRawClient;

    constructor(client: TwilioRawClient) {
        this.client = client;
    }

    async getChats(activeNumber: string): Promise<ChatInfo[]> {
        const knownContacts = new Set<string>();
        const arr: ChatInfo[] = [];
        const [outbound, inbound] = await Promise.all([
            this.client.getMessages({ from: activeNumber }),
            this.client.getMessages({ to: activeNumber }),
        ]);

        const full = this.mergeTwoSortedArrays(inbound.items, outbound.items);

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
