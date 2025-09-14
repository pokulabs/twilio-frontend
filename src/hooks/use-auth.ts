import { useEffect, useState } from "react";
import { authClient } from "../services/auth";

export function useAuth() {
    const { data, isPending, error } = authClient.useSession();
    const [organizations, setOrganizations] = useState<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        logo?: string | null | undefined | undefined;
        metadata?: any;
    }[] | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const isAuthenticated = !!data;

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        authClient.organization
            .list()
            .then((res) => {
                if (res.data) {
                    setOrganizations(res.data);
                }
            });

        authClient.admin
            .hasPermission({
                permissions: {
                    user: ["create"],
                },
            })
            .then((res) => {
                if (res.data?.success) {
                    setIsAdmin(true);
                }
            });
    }, [isAuthenticated]);

    return {
        isInOrg: !!organizations?.length,
        userEmail: data?.user.email,
        isLoading: isPending,
        isAuthenticated: isAuthenticated,
        isAdmin: isAdmin,
        errorMessage: error?.message,
        signOut: authClient.signOut,
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
