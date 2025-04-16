import TwilioRawClient from "./twilio-raw-client";

import type { PlainMessage, TwilioMsg } from "../types";

export class MessagesService {
    private client: TwilioRawClient;

    constructor(client: TwilioRawClient) {
        this.client = client;
    }

    async getMessages(
        activeNumber: string,
        contactNumber: string,
    ): Promise<PlainMessage[]> {
        const [paginatorToUs, paginatorFromUs] = await Promise.all([
            this.client.getMessages({ from: contactNumber, to: activeNumber }),
            this.client.getMessages({ from: activeNumber, to: contactNumber }),
        ]);
        const msgsToUs = paginatorToUs.items;
        const msgsFromUs = paginatorFromUs.items;

        const twilioMsgs: TwilioMsg[] = [];

        let toPointer = 0;
        let fromPointer = 0;
        while (toPointer < msgsToUs.length && fromPointer < msgsFromUs.length) {
            if (
                msgsToUs[toPointer].dateSent > msgsFromUs[fromPointer].dateSent
            ) {
                twilioMsgs.unshift(msgsToUs[toPointer]);
                toPointer++;
            } else {
                twilioMsgs.unshift(msgsFromUs[fromPointer]);
                fromPointer++;
            }
        }

        while (toPointer < msgsToUs.length) {
            twilioMsgs.unshift(msgsToUs[toPointer]);
            toPointer++;
        }
        while (fromPointer < msgsFromUs.length) {
            twilioMsgs.unshift(msgsFromUs[fromPointer]);
            fromPointer++;
        }

        const msgs = twilioMsgs.map((e) => ({
            content: e.body,
            timestamp: e.dateSent.getTime(),
            direction:
                e.direction === "inbound"
                    ? ("received" as "received")
                    : ("sent" as "sent"), // Explicitly type the direction
            from: e.from,
            to: e.to,
            id: e.sid,
            status: e.status,
        }));

        return msgs;
    }

    async sendMessage(
        activeNumber: string,
        to: string,
        msg: string,
    ): Promise<void> {
        await this.client.sendMessage(activeNumber, to, msg);
    }
}
