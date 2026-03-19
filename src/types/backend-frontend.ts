export type Medium =
    | "sms"
    | "sms_poku"
    | "whatsapp"
    | "whatsapp_poku"
    | "slack_poku"
    | "slack"
    | "call_poku"
    | "dashboard_poku";

export type InteractionFormFieldType =
    | "text"
    | "textarea"
    | "email"
    | "tel"
    | "select"
    | "checkbox";

export type InteractionFormFieldOption = {
    label: string;
    value: string;
};

export type InteractionFormField = {
    id: string;
    label: string;
    type: InteractionFormFieldType;
    required?: boolean;
    placeholder?: string;
    helper_text?: string;
    options?: InteractionFormFieldOption[];
    pattern?: string;
    min_length?: number;
    max_length?: number;
};

export type InteractionFormRequest = {
    title: string;
    description?: string;
    submit_label?: string;
    fields: InteractionFormField[];
};

export type InteractionFormResponse = {
    values: Record<string, string | boolean>;
};

export type InteractionMessage = {
    body?: string;
    image_links?: string[];
    form_request?: InteractionFormRequest;
    form_response?: InteractionFormResponse;
};

export function convertCreditsToCents(credits: number) {
    return Math.round(credits * 2.5);
}

export function convertCentsToCredits(cents: number) {
    return Math.round(cents / 2.5);
}