import TwilioRawClient from "./twilio-raw-client.ts";

export class PhoneNumbersService {
    private client: TwilioRawClient;

    constructor(client: TwilioRawClient) {
        this.client = client;
    }

    async getPhoneNumbers(): Promise<string[]> {
        return this.client.getPhoneNumbers();
    }
}
