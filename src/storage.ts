import type { WebhooksActivationStatus } from "./types";

type Store = {
    sid: string;
    authToken: string;
    mostRecentMessageSeenPerChat: {
        [chatId: string]: string | undefined; // messageId
    };
    mainStore: {
        webhookUrl: string;
        webhooksActivationStatus: WebhooksActivationStatus;
        whatsappNumbers: string[];
    };
    user: {
        id: string;
        email: string;
        name: string;
        idToken: string;
    };
};

const storageDefaults: Store = {
    sid: "",
    authToken: "",
    mostRecentMessageSeenPerChat: {},
    mainStore: {
        webhookUrl: "",
        webhooksActivationStatus: {
            "update-autonomy-state": true,
        },
        whatsappNumbers: [],
    },
    user: {
        id: "",
        email: "",
        name: "",
        idToken: "",
    },
};

class Storage {
    private setDefaults(obj: any, defaults: any) {
        for (const key in defaults) {
            if (
                typeof defaults[key] === "object" &&
                defaults[key] !== null &&
                !Array.isArray(defaults[key])
            ) {
                // If the key is an object, recurse
                if (!obj[key]) {
                    obj[key] = {};
                }
                this.setDefaults(obj[key], defaults[key]);
            } else {
                // If the key is not present in the object, set the default value
                if (!(key in obj)) {
                    obj[key] = defaults[key];
                }
            }
        }
    }

    init() {
        if (localStorage.getItem("sid") === null) {
            localStorage.setItem("sid", storageDefaults.sid);
        }
        if (localStorage.getItem("authToken") === null) {
            localStorage.setItem("authToken", storageDefaults.authToken);
        }
        if (localStorage.getItem("mostRecentMessageSeenPerChat") === null) {
            localStorage.setItem(
                "mostRecentMessageSeenPerChat",
                JSON.stringify(storageDefaults.mostRecentMessageSeenPerChat),
            );
        }
        const mainStoreText = localStorage.getItem("mainStore");
        const mainStore = mainStoreText ? JSON.parse(mainStoreText) : {};
        this.setDefaults(mainStore, storageDefaults.mainStore);
        localStorage.setItem("mainStore", JSON.stringify(mainStore));

        const userText = localStorage.getItem("user");
        const user = userText ? JSON.parse(userText) : {};
        this.setDefaults(user, storageDefaults.user);
        localStorage.setItem("user", JSON.stringify(user));
    }

    get<K extends keyof Store>(key: K): Store[K] {
        const item = localStorage.getItem(key)!;
        if (key === "sid" || key === "authToken") {
            return item as Store[K];
        }
        return JSON.parse(item) as Store[K];
    }

    setWebhookUrl(url: string) {
        const obj = this.get("mainStore");
        obj.webhookUrl = url;
        localStorage.setItem("mainStore", JSON.stringify(obj));
    }

    setWebhooksActivationStatus<
        K extends keyof Store["mainStore"]["webhooksActivationStatus"],
    >(key: K, value: boolean) {
        const obj = this.get("mainStore");
        obj.webhooksActivationStatus[key] = value;
        localStorage.setItem("mainStore", JSON.stringify(obj));
    }

    setCredentials(sid: string, authToken: string) {
        localStorage.setItem("sid", sid);
        localStorage.setItem("authToken", authToken);
    }

    updateMostRecentlySeenMessageId(chatId: string, messageId: string) {
        const obj = this.get("mostRecentMessageSeenPerChat");
        obj[chatId] = messageId;
        localStorage.setItem(
            "mostRecentMessageSeenPerChat",
            JSON.stringify(obj),
        );
    }

    setWhatsappNumbers(numbers: string[]) {
        const obj = this.get("mainStore");
        obj.whatsappNumbers = numbers;
        localStorage.setItem("mainStore", JSON.stringify(obj));
    }

    getUser() {
        return this.get("user");
    }

    setUser(id: string, email: string, name: string, idToken: string) {
        const obj = {
            ...this.get("user"),
            id,
            email,
            name,
            idToken,
        };
        localStorage.setItem("user", JSON.stringify(obj));
    }

    removeUser() {
        const user = {};
        this.setDefaults(user, storageDefaults.user);
        localStorage.setItem("user", JSON.stringify(user));
    }
}

export const storage = new Storage();
