import axios, { type AxiosInstance } from "axios";
import type { MessageDirection } from "./types/types";
import { Recipient } from "./components/Campaigns/CsvUploader";
import { checkIsAuthenticated } from "./services/auth";
import { Medium } from "./types/backend-frontend";

declare module "axios" {
    interface AxiosRequestConfig {
        skipAuth?: boolean;
    }

    interface InternalAxiosRequestConfig {
        skipAuth?: boolean;
    }
}

class ApiClient {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            // Need this for cookie based session auth
            withCredentials: true,
        });

        this.api.interceptors.request.use(async (config) => {
            if (config.skipAuth) {
                return config;
            }

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

        // Add response interceptor to handle abort errors
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Check if the error is due to request abortion
                if (
                    error.name === "AbortError" ||
                    error.code === "ERR_CANCELED"
                ) {
                    return Promise.resolve({ data: undefined });
                }
                return Promise.reject(error);
            },
        );
    }

    async getTwilioCreds() {
        return this.api.get<{ id: string; key: string } | undefined>(
            "/account/keys/twilio",
        );
    }

    async checkLlmKeyExists() {
        return this.api.get<{ key: string } | undefined>(
            "/account/keys/openai",
        );
    }

    async checkVapiKeyExists() {
        return this.api.get<{ key: string } | undefined>("/account/keys/vapi");
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

    async createInteractionChannel(
        humanNumber: string,
        agentNumber: string,
        waitTime: number | undefined,
        medium: Medium,
        webhook: string | undefined,
        validTime: number | undefined,
        linkEnabled: boolean | undefined,
    ) {
        return this.api.post<{ id: string } | undefined>("/account", {
            humanNumber: humanNumber,
            agentNumber: agentNumber,
            waitTime: waitTime,
            medium: medium,
            webhook: webhook,
            validTime: validTime,
            linkEnabled: linkEnabled,
        });
    }

    async getInteractionChannels() {
        return this.api.get<
            | {
                  data: {
                      id: string;
                      humanNumber: string;
                      agentNumber: string;
                      waitTime: number;
                      medium: Medium;
                      webhook?: string;
                      validTime?: number;
                      linkEnabled?: boolean;
                  }[];
              }
            | undefined
        >("/account");
    }

    async getAccountCredits() {
        return this.api.get<
            | {
                  creditsRemaining: number;
              }
            | undefined
        >("/account/credits");
    }

    async deleteInteractionChannel(interactionChannelId: string) {
        return this.api.delete(`/account/${interactionChannelId}`);
    }

    async getAgents() {
        return this.api.get<
            | {
                  data: {
                      id: string;
                      prompt: string;
                      messageDirection: MessageDirection;
                  }[];
              }
            | undefined
        >("/agents");
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

    async getChats(
        filters: {
            chatsOfInterest?: string[];
            isFlagged?: boolean;
            isClaimed?: boolean;
            labelIds?: string[];
        } = {},
    ) {
        return this.api.post<
            | {
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
                      labels?: {
                          id: string;
                          color: string;
                          name: string;
                      }[];
                  }[];
              }
            | undefined
        >("/chats", filters);
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

    // Labels APIs
    async listUserLabels() {
        return this.api.get<
            { data: { id: string; name: string; color: string }[] } | undefined
        >("/user-settings/labels");
    }

    async getChatLabels(chatId: string) {
        return this.api.get<
            { data: { id: string; name: string; color: string }[] } | undefined
        >(`/chats/${chatId}/labels`);
    }

    async createLabel(name: string, color: string) {
        return this.api.post<
            { id: string; name: string; color: string } | undefined
        >("/user-settings/labels", { name, color });
    }
    async assignLabelToChat(chatId: string, labelId: string) {
        return this.api.post(`/chats/${chatId}/labels/${labelId}`);
    }

    async unassignLabelFromChat(chatId: string, labelId: string) {
        return this.api.delete(`/chats/${chatId}/labels/${labelId}`);
    }

    // Notes (lazy-loaded) for CRM modal
    async getChatNotes(chatId: string) {
        return this.api.get<{ notes: string | null | undefined }>(
            `/chats/${chatId}/notes`,
        );
    }

    async saveChatNotes(chatId: string, notes: string) {
        return this.api.post(`/chats/${chatId}/notes`, { notes });
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

    async sendTestMessage(interactionChannelId: string) {
        return this.api.post("/account/test", {
            interactionChannelId: interactionChannelId,
        });
    }

    async unassignChat(chatId: string) {
        return this.api.post(`/chats/${chatId}/unassign`);
    }

    async assignChat(chatId: string, assigneeUserId: string) {
        return this.api.post(`/chats/${chatId}/assign`, {
            assignee: assigneeUserId,
        });
    }

    async sendDemoMessage(message: string, phoneNumber: string) {
        return this.api.post(
            "/playground/chat",
            {
                message,
                phoneNumber,
            },
            { skipAuth: true },
        );
    }

    async getPublicReply(token: string) {
        return this.api.get<
            | {
                  message: string;
                  secondsRemaining: number;
                  expired: boolean;
                  alreadyResponded: boolean;
              }
            | undefined
        >(`/public/reply/${token}`, { skipAuth: true });
    }

    async submitPublicReply(token: string, message: string) {
        return this.api.post(
            `/public/reply/${token}`,
            { message },
            { skipAuth: true },
        );
    }

    async getActiveInteractions() {
        return this.api.get<
            | {
                  data: {
                      id: string;
                      createdAt: string;
                      type: string;
                      humanNumber: string;
                      agentNumber: string | null;
                      waitTime: number;
                      medium: Medium;
                      message: string;
                      metadata: Record<string, unknown> | null;
                      expiresAt: string;
                  }[];
              }
            | undefined
        >("/interactions/active");
    }

    async respondToInteraction(interactionId: string, response: string) {
        return this.api.post(`/interactions/${interactionId}/respond`, {
            response,
        });
    }

    async getInteractions(params: { page?: number; pageSize?: number } = {}) {
        const search = new URLSearchParams();
        if (params.page) search.set("page", String(params.page));
        if (params.pageSize) search.set("pageSize", String(params.pageSize));
        const qs = search.toString();
        return this.api.get<
            | {
                  data: {
                      id: string;
                      createdAt: string;
                      type: string;
                      humanNumber: string;
                      agentNumber: string;
                      waitTime: number;
                      medium: Medium;
                      message: string;
                      response: string | null;
                      responseTime: string | null;
                  }[];
                  pagination: {
                      page: number;
                      pageSize: number;
                      total: number;
                      totalPages: number;
                  };
              }
            | undefined
        >(`/interactions${qs ? `?${qs}` : ""}`);
    }
}

export const apiClient = new ApiClient();
