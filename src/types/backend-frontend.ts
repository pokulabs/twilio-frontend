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
    | "checkbox"
    | "address";

export type InteractionFormFieldOption = {
    label: string;
    value: string;
};

export type InteractionFormStringValidationRule = {
    title: string;
    pattern: string;
};

export type InteractionFormField = {
    id: string;
    label: string;
    type: InteractionFormFieldType;
    required?: boolean;
    placeholder?: string;
    helper_text?: string;
    options?: InteractionFormFieldOption[];
    validations?: InteractionFormStringValidationRule[];
};

export type InteractionFormRequest = {
    title: string;
    description?: string;
    brand_image_url?: string;
    submit_label?: string;
    fields: InteractionFormField[];
};

export type InteractionAddressValue = {
    text: string;
    place_id: string;
};

export type InteractionFormValue =
    | string
    | boolean
    | InteractionAddressValue;

export type InteractionFormResponse = {
    values: Record<string, InteractionFormValue>;
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

export function isAddressValue(
    value: InteractionFormValue | undefined,
): value is InteractionAddressValue {
    return (
        typeof value === "object"
        && value !== null
        && "text" in value
        && "place_id" in value &&
        typeof value.text === "string" &&
        typeof value.place_id === "string"
    );
}

export function getFieldValidationError(
    field: InteractionFormField,
    value: InteractionFormValue | undefined,
) {
    if (field.type === "address") {
        if (!isAddressValue(value) || !value.text.trim() || !value.place_id.trim()) {
            return field.required
                ? `${field.label} must be selected from the address suggestions.`
                : null;
        }
        return null;
    }

    if (field.type === "checkbox") {
        if (typeof value !== "boolean") {
            return field.required ? `${field.label} is required.` : null;
        }
        if (field.required && value !== true) {
            return `${field.label} is required.`;
        }
        return null;
    }

    const stringValue = typeof value === "string" ? value.trim() : "";
    if (!stringValue) {
        return field.required ? `${field.label} is required.` : null;
    }

    if (
        field.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
    ) {
        return `${field.label} must be a valid email address.`;
    }

    if (field.type === "select") {
        const validValues = new Set(field.options?.map((option) => option.value) ?? []);
        if (!validValues.has(stringValue)) {
            return `${field.label} must be one of the provided options.`;
        }
    }

    for (const rule of field.validations ?? []) {
        if (!evaluateStringValidationRule(rule, stringValue)) {
            return getRuleErrorMessage(field, rule);
        }
    }

    return null;
}

export function getRuleErrorMessage(
    field: InteractionFormField,
    rule: InteractionFormStringValidationRule,
) {
    return `${field.label} must satisfy: ${rule.title}.`;
}

export function evaluateStringValidationRule(
    rule: InteractionFormStringValidationRule,
    value: string,
) {
    return testRegex(rule.pattern, value);
}

function testRegex(pattern: string, value: string) {
    try {
        return new RegExp(pattern).test(value);
    } catch {
        return false;
    }
}
