import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || "ws://localhost:3000",
    plugins: [
        magicLinkClient()
    ]
});
