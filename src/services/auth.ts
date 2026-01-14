import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    plugins: [magicLinkClient(), adminClient(), organizationClient()],
});

// Cache for session check to avoid hitting the API on every request
let cachedSessionResult: boolean | null = null;
let sessionCheckPromise: Promise<boolean> | null = null;
const SESSION_CACHE_TTL = 30_000; // 30 seconds
let sessionCacheTimestamp = 0;

export async function checkIsAuthenticated() {
    const now = Date.now();

    // Return cached result if still valid
    if (
        cachedSessionResult !== null &&
        now - sessionCacheTimestamp < SESSION_CACHE_TTL
    ) {
        return cachedSessionResult;
    }

    // If a check is already in flight, wait for it
    if (sessionCheckPromise) {
        return sessionCheckPromise;
    }

    // Perform the check and cache the result
    sessionCheckPromise = authClient.getSession().then((res) => {
        cachedSessionResult = !!res.data;
        sessionCacheTimestamp = Date.now();
        sessionCheckPromise = null;
        return cachedSessionResult;
    });

    return sessionCheckPromise;
}

/**
 * Clear the session cache (call on logout or when session state changes)
 */
export function clearSessionCache() {
    cachedSessionResult = null;
    sessionCacheTimestamp = 0;
    sessionCheckPromise = null;
}
