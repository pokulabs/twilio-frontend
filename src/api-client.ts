import axios, { AxiosInstance } from "axios";
import { storage } from "./storage";
import type { CredentialResponse } from "@react-oauth/google";

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

    async login(credentialResponse: CredentialResponse) {
        return axios.post(import.meta.env.VITE_API_URL + "/auth/google", {
            token: credentialResponse.credential,
        });
    }
}

export const apiClient = new ApiClient();
