import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL,
    plugins: [magicLinkClient(), adminClient(), organizationClient()],
});

export async function checkIsAuthenticated() {
    const res = await authClient.getSession();
    return !!res.data;
}
