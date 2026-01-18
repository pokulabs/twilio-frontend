export type Medium =
    | "sms"
    | "sms_poku"
    | "whatsapp"
    | "whatsapp_poku"
    | "slack_poku"
    | "slack"
    | "call_poku"
    | "dashboard_poku";

export type InteractionMessage = {
    body: string;
    image_links?: string[];
};

export function convertCreditsToCents(credits: number) {
    return Math.round(credits * 2.5);
}

export function convertCentsToCredits(cents: number) {
    return Math.round(cents / 2.5);
}