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
        // document.body.style.overflow = "hidden";
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
        // document.body.style.removeProperty("overflow");
    }
}

export function toggleMessagesPane() {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const slideIn = window
            .getComputedStyle(document.getElementById("messages-component")!)
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

export const POLL_INTERVAL = 3000; // every 3 seconds
export const DOCS_LINK =
    "https://docs.google.com/document/d/1gIfciWfCTrKlyVgYXdARi6ZJhOiOfOPDtq39FtwEYBA/edit?usp=sharing";
export const SLACK_LINK =
    "https://join.slack.com/t/pokulabs/shared_invite/zt-334pmqhy9-oZN8cMAXLFUdmDCgNZX9rA";
export const GITHUB_LINK = "https://github.com/pokulabs/twilio-frontend";
