import { POLL_INTERVAL } from "./utils";
import TwilioRawClient from "./services/twilio-raw-client";

import type { PlainMessage, TwilioMsg } from "./types";

type Event = "new-message";
type CB = (msg: PlainMessage) => void;

export class EventEmitter {
    private static instance: EventEmitter | undefined;
    private twilioClient: TwilioRawClient;
    private callbacks: Record<Event, CB[]> = {
        "new-message": [],
    };
    private lastKnownMsgId = "";

    private constructor(twilioClient: TwilioRawClient) {
        this.twilioClient = twilioClient;
    }

    async init() {
        const msgs = await this.twilioClient.getMessages({ limit: 1 });
        this.lastKnownMsgId = msgs.items[0].sid;
        setInterval(this.checkForNewMessage.bind(this), POLL_INTERVAL);
    }

    static async getInstance(twilioClient: TwilioRawClient) {
        if (
            !EventEmitter.instance ||
            twilioClient.sid !== EventEmitter.instance.twilioClient.sid ||
            twilioClient.authToken !==
                EventEmitter.instance.twilioClient.authToken
        ) {
            const ee = new EventEmitter(twilioClient);
            // Init and test connection
            await ee.init();
            EventEmitter.instance = ee;
        }

        return EventEmitter.instance;
    }

    on(event: Event, cb: CB) {
        this.callbacks[event].push(cb);
        return this.createId(event, this.callbacks[event].length - 1);
    }

    off(id: string) {
        const { event, index } = this.parseId(id);
        this.callbacks[event].splice(index, 1);
    }

    async checkForNewMessage() {
        try {
            if (!this.twilioClient) return;
            const msgs = await this.twilioClient.getMessages({ limit: 1 });
            if (msgs.items[0].sid !== this.lastKnownMsgId) {
                const interveningMsgs = await this.fetchInterveningMsgs();
                console.log(interveningMsgs);
                this.lastKnownMsgId = msgs.items[0].sid;
                this.emitNewMsgs(interveningMsgs);
            }
        } catch (err) {
            console.error("Failed to fetch chats:", err);
        }
    }

    private createId(event: Event, index: number) {
        return `${event}:${index}`;
    }

    private parseId(id: string) {
        const [event, index] = id.split(":");
        return { event: event as Event, index: +index };
    }

    private async fetchInterveningMsgs() {
        const interveningMsgs: TwilioMsg[] = [];
        let found = false;
        let iteration = 0;

        let msgs = await this.twilioClient.getMessages();
        do {
            const foundIndex = msgs.items.findIndex(
                (m) => m.sid === this.lastKnownMsgId,
            );
            if (foundIndex !== -1) {
                const newMsgs = msgs.items.slice(0, foundIndex);
                interveningMsgs.push(...newMsgs);
                found = true;
            } else {
                interveningMsgs.push(...msgs.items);
            }

            if (msgs.hasNextPage()) {
                msgs = await msgs.getNextPage();
            }

            iteration++;
        } while (!found && msgs.hasNextPage() && iteration < 100);

        return interveningMsgs;
    }

    private emitNewMsgs(msgs: TwilioMsg[]) {
        const msgsOldestToNewest = msgs.reverse();
        for (const cb of this.callbacks["new-message"]) {
            for (const msg of msgsOldestToNewest) {
                cb({
                    content: msg.body,
                    timestamp: msg.dateSent.getTime(),
                    direction:
                        msg.direction === "inbound"
                            ? ("received" as "received")
                            : ("sent" as "sent"), // Explicitly type the direction
                    from: msg.from,
                    to: msg.to,
                    id: msg.sid,
                    status: msg.status,
                });
            }
        }
    }
}
