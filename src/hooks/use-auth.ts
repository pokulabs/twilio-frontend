import { authClient } from "../services/auth";

export function useAuth() {
    const { data, isPending, error } = authClient.useSession();

    return {
        userEmail: data?.user.email,
        isLoading: isPending,
        isAuthenticated: !!data,
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
    };
}
