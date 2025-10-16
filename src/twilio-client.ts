import { MessagesService } from "./services/messages.service";
import {
    ContactsService,
    type GetChatsOptions,
} from "./services/chats.service";
import { PhoneNumbersService } from "./services/phone-numbers.service";
import TwilioRawClient from "./services/twilio-raw-client";
import type { ChatInfo, PlainMessage } from "./types";

class TwilioClient {
    axiosInstance: TwilioRawClient;
    sid: string;
    authToken: string;

    private static instance: TwilioClient | undefined;
    private messagesService: MessagesService;
    private contactsService: ContactsService;
    private phoneNumbersService: PhoneNumbersService;

    private constructor(sid: string, token: string) {
        this.sid = sid;
        this.authToken = token;
        this.axiosInstance = new TwilioRawClient(sid, token);

        this.messagesService = new MessagesService(this.axiosInstance);
        this.contactsService = new ContactsService(this.axiosInstance);
        this.phoneNumbersService = new PhoneNumbersService(this.axiosInstance);
    }

    static async getInstance(sid: string, token: string) {
        if (
            !TwilioClient.instance ||
            sid !== TwilioClient.instance.sid ||
            token !== TwilioClient.instance.authToken
        ) {
            const client = new TwilioClient(sid, token);
            // Test connection
            await client.getPhoneNumbers();
            TwilioClient.instance = client;
        }

        return TwilioClient.instance;
    }

    async getPhoneNumbers() {
        return this.phoneNumbersService.getPhoneNumbers();
    }

    async getChat(activeNumber: string, contactNumber: string) {
        return this.contactsService.getChat(activeNumber, contactNumber);
    }

    async getChats(activeNumber: string, opts: GetChatsOptions) {
        return this.contactsService.getChats(activeNumber, opts);
    }

    async getChatsByIds(chatIds: string[]) {
        return this.contactsService.getChatsByIds(chatIds);
    }

    async getMessages(activeNumber: string, contactNumber: string) {
        return this.messagesService.getMessages(activeNumber, contactNumber);
    }

    async sendMessage(activeNumber: string, to: string, body: string) {
        return this.messagesService.sendMessage(activeNumber, to, body);
    }

    updateMostRecentlySeenMessageId(chatId: string, msgs: PlainMessage[]) {
        return this.contactsService.updateMostRecentlySeenMessageId(
            chatId,
            msgs,
        );
    }

    hasUnread(activeNumber: string, chats: ChatInfo[]) {
        return this.contactsService.hasUnread(activeNumber, chats);
    }
}

export default TwilioClient;
