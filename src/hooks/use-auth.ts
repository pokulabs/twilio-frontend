import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authClient, clearSessionCache } from "../services/auth";

// Shared state for auth info - only fetched once
let authInfoFetched = false;
let authInfoPromise: Promise<void> | null = null;
let cachedAuthInfo: {
    organizations: {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        logo?: string | null;
        metadata?: any;
    }[] | null;
    isAdmin: boolean;
    orgMemberRole: "owner" | "admin" | "member" | null;
    orgMembers: { email: string; id: string }[];
} = {
    organizations: null,
    isAdmin: false,
    orgMemberRole: null,
    orgMembers: [],
};

// Subscribers for when auth info updates
const subscribers: Set<() => void> = new Set();

function notifySubscribers() {
    subscribers.forEach((fn) => fn());
}

async function fetchAuthInfo() {
    if (authInfoFetched || authInfoPromise) {
        return authInfoPromise;
    }

    authInfoPromise = (async () => {
        const orgs = await authClient.organization.list();
        if (orgs.data) {
            cachedAuthInfo.organizations = orgs.data;

            if (orgs.data.length) {
                await authClient.organization.setActive({
                    organizationId: orgs.data[0].id,
                });
                const orgMember =
                    await authClient.organization.getActiveMember();
                if (orgMember.data?.role) {
                    cachedAuthInfo.orgMemberRole = orgMember.data.role as
                        | "admin"
                        | "member"
                        | "owner";
                }

                const fullOrg =
                    await authClient.organization.getFullOrganization();
                if (fullOrg.data) {
                    cachedAuthInfo.orgMembers = fullOrg.data.members.map(
                        (e) => ({
                            email: e.user.email,
                            id: (e.user as any).id,
                        }),
                    );
                }
            }
        }

        const hasPermission = await authClient.admin.hasPermission({
            permissions: {
                user: ["create"],
            },
        });
        if (hasPermission.data?.success) {
            cachedAuthInfo.isAdmin = true;
        }

        authInfoFetched = true;
        notifySubscribers();
    })();

    return authInfoPromise;
}

function resetAuthInfo() {
    authInfoFetched = false;
    authInfoPromise = null;
    cachedAuthInfo = {
        organizations: null,
        isAdmin: false,
        orgMemberRole: null,
        orgMembers: [],
    };
}

export function useAuth() {
    const { data, isPending, error } = authClient.useSession();
    const isAuthenticated = !!data;

    // Force re-render when auth info updates
    const [, forceUpdate] = useState({});

    useEffect(() => {
        const handleUpdate = () => forceUpdate({});
        subscribers.add(handleUpdate);
        return () => {
            subscribers.delete(handleUpdate);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated && !authInfoFetched && !authInfoPromise) {
            fetchAuthInfo();
        }
    }, [isAuthenticated]);

    return {
        isInOrg: !!cachedAuthInfo.organizations?.length,
        userId: data?.user.id,
        userEmail: data?.user.email,
        isLoading: isPending,
        isAuthenticated: isAuthenticated,
        isAdmin: cachedAuthInfo.isAdmin,
        orgMembers: cachedAuthInfo.orgMembers,
        isOrgAdmin:
            cachedAuthInfo.orgMemberRole === "owner" ||
            cachedAuthInfo.orgMemberRole === "admin",
        errorMessage: error?.message,
        signOut: () => {
            clearSessionCache();
            resetAuthInfo();
            return authClient.signOut();
        },
        signInGoogle: (redirect: string) => {
            return authClient.signIn.social({
                provider: "google",
                callbackURL: import.meta.env.VITE_UI_URL + redirect,
            });
        },
        signInMagicLink(email: string, redirect: string) {
            return authClient.signIn.magicLink({
                email,
                callbackURL: import.meta.env.VITE_UI_URL + redirect,
            });
        },
        impersonateUser(userId: string) {
            return authClient.admin.impersonateUser({
                userId: userId,
            });
        },
    };
}
