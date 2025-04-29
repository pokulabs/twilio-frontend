import axios, { type AxiosInstance } from "axios";
import { storage } from "./storage";
import type { CredentialResponse } from "@react-oauth/google";
import type { MessageDirection } from "./types";

class ApiClient {
    private api: AxiosInstance;

    constructor() {
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

    async checkLlmKeyExists() {
        return this.api.get("/account/llm");
    }

    async createLlmKey(key: string) {
        return this.api.post("/account/llm", {
            llmKey: key,
        });
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
                isEnabled: boolean;
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

    async setToggle(chatId: string, isEnabled: boolean) {
        return this.api.post(`/chats/${chatId}/toggle`, {
            isEnabled,
        });
    }

    async createApiKey() {
        return this.api.post("/auth/key");
    }

    async login(credentialResponse: CredentialResponse) {
        return axios.post(import.meta.env.VITE_API_URL + "/auth/google", {
            token: credentialResponse.credential,
        });
    }
}

export const apiClient = new ApiClient();
