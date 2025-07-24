import axios, { type AxiosInstance } from "axios";

import type { RawMsg, RawNumber, TwilioMsg } from "../types";

function transform(rawMsg: RawMsg): TwilioMsg {
    return {
        accountSid: rawMsg.account_sid,
        apiVersion: rawMsg.api_version,
        body: rawMsg.body,
        dateCreated: new Date(rawMsg.date_created),
        dateSent: new Date(rawMsg.date_sent),
        dateUpdated: new Date(rawMsg.date_updated),
        direction: rawMsg.direction as any,
        errorCode:  typeof rawMsg.error_code === "number" ? rawMsg.error_code : 0,
        errorMessage: rawMsg.error_message ?? "",
        from: rawMsg.from,
        messagingServiceSid: rawMsg.messaging_service_sid ?? "",
        numMedia: rawMsg.num_media,
        numSegments: rawMsg.num_segments,
        price: rawMsg.price,
        priceUnit: rawMsg.price_unit,
        sid: rawMsg.sid,
        status: rawMsg.status as any,
        to: rawMsg.to,
        uri: rawMsg.uri,
    };
}

class TwilioRawClient {
    sid: string;
    authToken: string;

    private axiosInstance: AxiosInstance;

    constructor(sid: string, token: string) {
        this.sid = sid;
        this.authToken = token;
        this.axiosInstance = axios.create({
            baseURL: `https://api.twilio.com/2010-04-01/Accounts/${sid}`,
            auth: {
                username: sid,
                password: token,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
    }

    async getPhoneNumbers() {
        const res = await this.axiosInstance.get<RawNumber>(
            "/IncomingPhoneNumbers.json",
        );
        return res.data.incoming_phone_numbers.map((e) => e.phone_number);
    }

    async getMessages(
        props: { from?: string; to?: string; limit?: number } = {},
    ): Promise<Paginator> {
        const res = await this.axiosInstance.get("/Messages.json", {
            params: {
                From: props.from,
                To: props.to,
                PageSize: props.limit ?? 1000,
            },
        });
        return new Paginator(
            this.sid,
            this.authToken,
            res.data.messages.map(transform),
            res.data.next_page_uri,
        );
    }

    async sendMessage(
        activeNumber: string,
        to: string,
        body: string,
    ): Promise<void> {
        const params = new URLSearchParams();
        params.append("From", activeNumber);
        params.append("Body", body);
        params.append("To", to);
        const res = await this.axiosInstance.post("/Messages.json", params);
        return res.data;
    }
}

class Paginator {
    items: TwilioMsg[] = [];

    private nextPageUri: string | null;
    private sid: string;
    private authToken: string;

    constructor(
        sid: string,
        authToken: string,
        items: TwilioMsg[],
        nextPageUri: string,
    ) {
        this.sid = sid;
        this.authToken = authToken;
        this.items = items;
        this.nextPageUri = nextPageUri;
    }

    hasNextPage() {
        return !!this.nextPageUri;
    }

    async getNextPage() {
        if (!this.nextPageUri) {
            throw new Error("Reached the end of the iterator.");
        }

        const res = await axios.get(
            `https://api.twilio.com${this.nextPageUri}`,
            {
                auth: {
                    username: this.sid,
                    password: this.authToken,
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );

        return new Paginator(
            this.sid,
            this.authToken,
            res.data.messages.map(transform),
            res.data.next_page_uri,
        );
    }
}

export default TwilioRawClient;
