import axios, { type AxiosInstance } from "axios";
import type { MessageDirection } from "./types";
import { Recipient } from "./components/Campaigns/CsvUploader";
import { storage } from "./storage";
import { authClient } from "./context/Auth";

class ApiClient {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
        });

        this.api.interceptors.request.use(async (config) => {
            const controller = new AbortController();

            config.withCredentials = true;

            const sesh = await authClient.getSession()
            const token = sesh.data?.session.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                controller.abort();
            }

            return {
                ...config,
                signal: controller.signal,
            };
        });
    }

    async checkTwilioCredsExist() {
        return this.api.get<{ hasKey: boolean }>("/account/keys/twilio");
    }

    async checkLlmKeyExists() {
        return this.api.get<{ hasKey: boolean }>("/account/keys/openai");
    }

    async checkVapiKeyExists() {
        return this.api.get<{ hasKey: boolean }>("/account/keys/vapi");
    }

    async createLlmKey(key: string) {
        return this.api.post("/account/keys", {
            platform: "openai",
            key: key,
        });
    }

    async createVapiKey(key: string) {
        return this.api.post("/account/keys", {
            platform: "vapi",
            key: key,
        });
    }

    async createTwilioKey(sid: string, key: string) {
        return this.api.post("/account/keys", {
            platform: "twilio",
            id: sid,
            key: key,
        });
    }

    async saveAccount(
        humanNumber: string,
        agentNumber: string,
        waitTime: number,
        usingHostedNumber: boolean,
    ) {
        return this.api.post("/account/hitl", {
            humanNumber: humanNumber,
            agentNumber: agentNumber,
            waitTime: waitTime,
            usingHostedNumber: usingHostedNumber,
        });
    }

    async getAccount() {
        return this.api.get<
            | {
                  humanNumber: string;
                  agentNumber: string;
                  waitTime: number;
                  usingHostedNumber: boolean;
                  haatMessageCount: number;
                  haatMessageLimit: number;
              }
            | undefined
        >("/account/hitl");
    }

    async getAgents() {
        return this.api.get<{
            data: {
                id: string;
                prompt: string;
                messageDirection: MessageDirection;
            }[];
        }>("/agents");
    }

    async createAgent(params: {
        prompt: string;
        messageDirection: MessageDirection;
    }) {
        return this.api.post(`/agents`, {
            prompt: params.prompt,
            messageDirection: params.messageDirection,
        });
    }

    async deleteAgent(id: string) {
        return this.api.delete(`/agents/${id}`);
    }

    async getFlaggedChats() {
        return this.api.get<{
            data: {
                chatCode: string;
                isDisabled: boolean;
                isFlagged: boolean;
                flaggedReason: string | undefined;
                flaggedMessage: string | undefined;
            }[];
        }>("/chats", {
            params: {
                isFlagged: true,
            },
        });
    }

    async resolveChat(chatId: string) {
        return this.api.post(`/chats/${chatId}/resolve`);
    }

    async getToggle(chatId: string) {
        return this.api.get(`/chats/${chatId}`);
    }

    async setToggle(chatId: string, isDisabled: boolean) {
        return this.api.post(`/chats/${chatId}/toggle`, {
            isDisabled,
        });
    }

    async createApiKey() {
        return this.api.post("/auth/key");
    }

    async refresh() {
        return this.api.post("/auth/refresh");
    }

    async createCampaign(
        name: string,
        template: string,
        recipients: Recipient[],
        senders: string[],
        phoneNumberKey: string,
    ) {
        return this.api.post("/campaigns", {
            name: name,
            template: template,
            recipients: recipients,
            senders: senders,
            phoneNumberKey: phoneNumberKey,
        });
    }

    async getCampaigns() {
        return this.api.get("/campaigns");
    }
}

export const apiClient = new ApiClient();
