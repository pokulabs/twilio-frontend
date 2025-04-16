import type { WebhooksActivationStatus } from "../../types";

const EX_1_REQ = `{
    "event": "update-autonomy-state",
    "data": {
      "id": "+12223334444+15556667777",
      "isEnabled": false
    }
  }`;

export const accordionContent: {
    id: keyof WebhooksActivationStatus;
    name: string;
    description: string[];
    testFunction: { name: string; args: any[] };
}[] = [
    {
        id: "update-autonomy-state",
        name: "Update autonomy state",
        description: [
            "This will fire each time you toggle a chat on or off",
            "It will send the following message:",
            EX_1_REQ,
        ],
        testFunction: {
            name: "updateAutonomyState",
            args: ["+12223334444+15556667777", false],
        },
    },
];
