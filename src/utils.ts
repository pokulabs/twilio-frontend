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
export function parseChatId(chatId: string) {
    let [_, activeNumber, contactNumber] = chatId.split("+");
    activeNumber = "+" + activeNumber;
    contactNumber = "+" + contactNumber;

    return {
        activeNumber,
        contactNumber,
    };
}

export function displayDynamicDateTime(d: Date) {
    const now = new Date();

    const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

    if (sameDay) {
        // Show time only, e.g., "10:45 AM"
        return displayTime(d);
    } else {
        // Show date only, e.g., "7/3/2025"
        return displayDate(d);
    }
}

export function displayDate(d: Date) {
    return d.toLocaleDateString();
}

export function displayTime(d: Date) {
    return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function displayDateTime(d: Date) {
    return displayDate(d) + " " + displayTime(d);
}

export function formatDurationHumanReadable(totalSeconds: number): string {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
    if (totalSeconds === 0) return "0 seconds";

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    const days = Math.floor(totalSeconds / secondsInDay);
    const hours = Math.floor((totalSeconds % secondsInDay) / secondsInHour);
    const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
    const seconds = Math.floor(totalSeconds % secondsInMinute);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    if (seconds > 0 || (parts.length === 0 && totalSeconds >= 0)) {
        parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
    }

    return parts.join(" ");
}

export const POLL_INTERVAL = 1000; // every 1 second
export const SLACK_LINK =
    "https://join.slack.com/t/pokulabs/shared_invite/zt-334pmqhy9-oZN8cMAXLFUdmDCgNZX9rA";
export const GITHUB_LINK = "https://github.com/pokulabs/twilio-frontend";
export const YOUTUBE_LINK = "https://www.youtube.com/@Poku-Labs";
