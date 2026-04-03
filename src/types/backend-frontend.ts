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

export type InteractionFormStringValidationNot = {
    pattern?: string;
    const?: string;
    enum?: string[];
};

export type InteractionFormStringValidationRule = {
    type?: "string";
    title: string;
    description?: string;
    pattern?: string;
    format?: "email";
    minLength?: number;
    maxLength?: number;
    const?: string;
    enum?: string[];
    not?: InteractionFormStringValidationNot;
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
    if (rule.pattern !== undefined && !testRegex(rule.pattern, value)) {
        return false;
    }

    if (rule.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return false;
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
        return false;
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return false;
    }

    if (rule.const !== undefined && value !== rule.const) {
        return false;
    }

    if (rule.enum !== undefined && !rule.enum.includes(value)) {
        return false;
    }

    if (rule.not !== undefined && evaluateStringValidationNot(rule.not, value)) {
        return false;
    }

    return true;
}

function evaluateStringValidationNot(
    rule: NonNullable<InteractionFormStringValidationRule["not"]>,
    value: string,
) {
    if (rule.pattern !== undefined && testRegex(rule.pattern, value)) {
        return true;
    }

    if (rule.const !== undefined && value === rule.const) {
        return true;
    }

    if (rule.enum !== undefined && rule.enum.includes(value)) {
        return true;
    }

    return false;
}

function testRegex(pattern: string, value: string) {
    try {
        return new RegExp(pattern).test(value);
    } catch {
        return false;
    }
}
