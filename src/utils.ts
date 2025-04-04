export function openSidebar() {
    if (typeof window !== "undefined") {
        document.body.style.overflow = "hidden";
        document.documentElement.style.setProperty(
            "--SideNavigation-slideIn",
            "1",
        );
    }
}

export function closeSidebar() {
    if (typeof window !== "undefined") {
        document.documentElement.style.removeProperty(
            "--SideNavigation-slideIn",
        );
        document.body.style.removeProperty("overflow");
    }
}

export function toggleSidebar() {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const slideIn = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--SideNavigation-slideIn");
        if (slideIn) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
}

export function openMessagesPane() {
    if (typeof window !== "undefined") {
        document.body.style.overflow = "hidden";
        document
            .getElementById("messages-component")!
            .style.setProperty("--MessagesPane-slideIn", "1");
    }
}

export function closeMessagesPane() {
    if (typeof window !== "undefined") {
        document
            .getElementById("messages-component")!
            .style.removeProperty("--MessagesPane-slideIn");
        document.body.style.removeProperty("overflow");
    }
}

export function toggleMessagesPane() {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const slideIn = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--MessagesPane-slideIn");
        if (slideIn) {
            closeMessagesPane();
        } else {
            openMessagesPane();
        }
    }
}

export function makeChatId(activeNumber: string, contactNumber: string) {
    return activeNumber + contactNumber;
}

export function displayDateTime(d: Date) {
    if (d.getDate() === new Date().getDate()) {
        const time = d.toLocaleTimeString();
        return time.split(":").slice(0, 2).join(":") + " " + time.split(" ")[1];
    } else {
        return d.toLocaleDateString();
    }
}

export const LOCAL_STORAGE_UNREAD_KEY = "mostRecentMessageSeenPerChat";
export const POLL_INTERVAL = 10000; // every 10 seconds
