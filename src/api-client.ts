import axios, { type AxiosInstance } from "axios";
import type { Medium, MessageDirection } from "./types";
import { Recipient } from "./components/Campaigns/CsvUploader";
import { checkIsAuthenticated } from "./services/auth";

class ApiClient {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            // Need this for cookie based session auth
            withCredentials: true,
        });

        this.api.interceptors.request.use(async (config) => {
            const controller = new AbortController();

            const isAuthenticated = await checkIsAuthenticated();
            if (!isAuthenticated) {
                controller.abort();
            }

            /**
             * Old code for authenticating via token in header
             */
            // if (token) {
            //     config.headers.Authorization = `Bearer ${token}`;
            // } else {
            //     controller.abort();
            // }

            return {
                ...config,
                signal: controller.signal,
            };
        });
    }

    async getTwilioCreds() {
        return this.api.get<{ id: string; key: string; } | undefined>("/account/keys/twilio");
    }

    async checkLlmKeyExists() {
        return this.api.get<{ key: string; } | undefined>("/account/keys/openai");
    }

    async checkVapiKeyExists() {
        return this.api.get<{ key: string; } | undefined>("/account/keys/vapi");
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
        medium: Medium,
    ) {
        return this.api.post<{ id: string; }>("/account", {
            humanNumber: humanNumber,
            agentNumber: agentNumber,
            waitTime: waitTime,
            medium: medium,
        });
    }

    async getAccount() {
        return this.api.get<
            | {
                data: {
                    id: string;
                    humanNumber: string;
                    agentNumber: string;
                    waitTime: number;
                    medium: Medium;
                }[];
              }
            | undefined
        >("/account");
    }

    async getAccountLimits() {
        return this.api.get<{
            haatMessageCount: number;
            lastReset: Date | undefined;
            haatMessageLimit: number;
        }>("/account/limits");
    }

    async deleteInteractionChannel(interactionChannelId: string) {
        return this.api.delete(`/account/${interactionChannelId}`);
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

    async getChats(chatsOfInterest: string[]) {
        return this.api.get<{
            data: {
                chatCode: string;
                isDisabled: boolean;
                isFlagged: boolean;
                flaggedReason?: string;
                flaggedMessage?: string;
                claimedBy?: string;
                enrichedData?: {
                    displayName: string;
                    card: string;
                    url: string;
                };
            }[];
        }>("/chats", {
            params: {
                chatsOfInterest: chatsOfInterest,
            },
            paramsSerializer: {
                indexes: true,
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

    async getEnrichedData(contactNumbers: string[]) {
        return this.api.post("/chats/enriched-data", {
            contactNumbers: contactNumbers,
        });
    }

    async downloadCampaignMessagesCsv(campaignId: string) {
        const response = await this.api.get(
            `/campaigns/${campaignId}/messages.csv`,
            {
                responseType: "blob", // Important for file downloads
            },
        );

        // Create a link and trigger download
        const url = window.URL.createObjectURL(
            new Blob([response.data], { type: "text/csv" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `campaign_${campaignId}_messages.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    async sendTestMessage() {
        return this.api.post("/account/test");
    }

    async claimChat(chatId: string) {
        return this.api.post(`/chats/${chatId}/claim`);
    }

    async unclaimChat(chatId: string) {
        return this.api.post(`/chats/${chatId}/unclaim`);
    }
}

export const apiClient = new ApiClient();
