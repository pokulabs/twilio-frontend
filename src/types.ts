export type ChatInfo = {
    contactNumber: string;
    chatId: string;
    recentMsgDate: Date;
    recentMsgId: string;
    recentMsgContent: string;
    hasUnread: boolean;
};

export type MessageProps = {
    id: string;
    content: string;
    timestamp: string;
    unread?: boolean;
    sender: ChatInfo | "You";
    attachment?: {
        fileName: string;
        type: string;
        size: string;
    };
};

export type PlainMessage = {
    content: string;
    timestamp: number;
    direction: "sent" | "received";
    from: string;
    to: string;
    id: string;
    status: MessageStatus;
};

export type RawMsg = {
    account_sid: string;
    api_version: string;
    body: string;
    date_created: string;
    date_sent: string;
    date_updated: string;
    direction: string;
    error_code: string | null;
    error_message: string | null;
    from: string;
    messaging_service_sid: string | null;
    num_media: string;
    num_segments: string;
    price: string;
    price_unit: string;
    sid: string;
    status: string;
    to: string;
    uri: string;
};

export type MessageStatus =
    | "queued"
    | "sending"
    | "sent"
    | "failed"
    | "delivered"
    | "undelivered"
    | "receiving"
    | "received"
    | "accepted"
    | "scheduled"
    | "read"
    | "partially_delivered"
    | "canceled";

export type TwilioMsg = {
    accountSid: string;
    apiVersion: string;
    body: string;
    dateCreated: Date;
    dateSent: Date;
    dateUpdated: Date;
    direction: string;
    errorCode: number;
    errorMessage: string;
    from: string;
    messagingServiceSid: string;
    numMedia: string;
    numSegments: string;
    price: string;
    priceUnit: string;
    sid: string;
    status: MessageStatus;
    to: string;
    uri: string;
};

export type RawNumber = {
    incoming_phone_numbers: {
        phone_number: string;
    }[];
};

export type WebhooksActivationStatus = {
    ["update-autonomy-state"]: boolean;
};
