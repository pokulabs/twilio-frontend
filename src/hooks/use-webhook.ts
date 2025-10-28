import React from "react";
import axios from "axios";

import { useTwilio } from "../context/TwilioProvider";

import type { WebhooksActivationStatus } from "../types/types";

class WebhookClient {
    private webhookUrl: string;
    private webhooksActivationStatus: WebhooksActivationStatus;

    constructor(
        webhookUrl: string,
        webhooksActivationStatus: WebhooksActivationStatus,
    ) {
        this.webhookUrl = webhookUrl;
        this.webhooksActivationStatus = webhooksActivationStatus;
    }

    async updateAutonomyState(chatId: string, isAutonomous: boolean) {
        if (
            !this.webhookUrl ||
            !this.webhooksActivationStatus["update-autonomy-state"]
        ) {
            return;
        }

        return axios.post(this.webhookUrl, {
            event: "update-autonomy-state",
            data: {
                id: chatId,
                isAutonomous,
            },
        });
    }
}

export function useWebhook() {
    const { webhookUrl, webhooksActivationStatus } = useTwilio();

    const webhookClient = React.useMemo(
        () => new WebhookClient(webhookUrl, webhooksActivationStatus),
        [webhookUrl, webhooksActivationStatus],
    );

    return { webhookClient };
}
