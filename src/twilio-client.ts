import axios, { AxiosInstance } from "axios";
import { MessagesService } from "./services/messages.service";
import { ContactsService } from "./services/contacts.service";
import { PhoneNumbersService } from "./services/phone-numbers.service";
import TwilioRawClient from "./services/twilio-raw-client";
import { storage } from "./storage";

import type { ChatInfo, PlainMessage } from "./types";

class TwilioClient {
    axiosInstance: TwilioRawClient;
    sid: string;
    authToken: string;

    private static instance: TwilioClient | undefined;
    private messagesService: MessagesService;
    private contactsService: ContactsService;
    private phoneNumbersService: PhoneNumbersService;
    private api: AxiosInstance;

    private constructor(sid: string, token: string) {
        this.sid = sid;
        this.authToken = token;
        this.axiosInstance = new TwilioRawClient(sid, token);

        this.messagesService = new MessagesService(this.axiosInstance);
        this.contactsService = new ContactsService(this.axiosInstance);
        this.phoneNumbersService = new PhoneNumbersService(this.axiosInstance);

        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
        });

        this.api.interceptors.request.use((config) => {
            const user = storage.getUser();
            if (user.idToken) {
                config.headers.Authorization = `Bearer ${user.idToken}`;
            }
            return config;
        });
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

    async getChats(activeNumber: string): Promise<ChatInfo[]> {
        return this.contactsService.getChats(activeNumber);
    }

    async getMessages(
        activeNumber: string,
        contactNumber: string,
    ): Promise<PlainMessage[]> {
        return this.messagesService.getMessages(activeNumber, contactNumber);
    }

    async sendMessage(activeNumber: string, to: string, body: string) {
        return this.messagesService.sendMessage(activeNumber, to, body);
    }

    updateMostRecentlySeenMessage(chatId: string, messageId: string) {
        return this.contactsService.updateMostRecentlySeenMessageId(
            chatId,
            messageId,
        );
    }

    async getToggle(chatId: string) {
        return this.api.get(`/chats/${chatId}/toggle`);
    }

    async setToggle(chatId: string, isEnabled: boolean) {
        return this.api.post(`/chats/${chatId}/toggle`, {
            isEnabled,
        });
    }

    async createApiKey() {
        return this.api.post(`/auth/key`);
    }
}

export default TwilioClient;
