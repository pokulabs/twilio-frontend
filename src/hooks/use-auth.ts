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
    const [orgMemberRole, setOrgMemberRole] = useState<"owner" | "admin" | "member" | null>(null);
    const [orgMembers, setOrgMembers] = useState<{ email: string, id: string; }[]>([]);
    const isAuthenticated = !!data;

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const setAuthInfo = async () => {
            const orgs = await authClient.organization.list();
            if (orgs.data) {
                setOrganizations(orgs.data);

                if (orgs.data.length) {
                    await authClient.organization.setActive({
                        organizationId: orgs.data[0].id,
                    });
                }
            }
    
            const hasPermission = await authClient.admin.hasPermission({
                permissions: {
                    user: ["create"],
                }
            });
            if (hasPermission.data?.success) {
                setIsAdmin(true);
            }
    
            const orgMember = await authClient.organization.getActiveMember();
            if (orgMember.data?.role) {
                setOrgMemberRole(orgMember.data.role as "admin" | "member" | "owner");
            }

            const fullOrg = await authClient.organization.getFullOrganization();
            if (fullOrg.data) {
                const memberList = fullOrg.data.members.map(e => {
                    return {
                        email: e.user.email,
                        id: (e.user as any).id,
                    };
                });
                setOrgMembers(memberList);
            }
        };

        void setAuthInfo();

    }, [isAuthenticated]);

    return {
        isInOrg: !!organizations?.length,
        userId: data?.user.id,
        userEmail: data?.user.email,
        isLoading: isPending,
        isAuthenticated: isAuthenticated,
        isAdmin: isAdmin,
        orgMembers: orgMembers,
        isOrgAdmin: orgMemberRole === "owner" || orgMemberRole === "admin",
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
