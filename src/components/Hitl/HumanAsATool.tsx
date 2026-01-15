import { useRef, useState } from "react";
import { Stack, Box, Divider } from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import withLoggedIn from "../../context/withLoggedIn";
import { ListInteractionChannels } from "./ListInteractionChannels";
import { MediumSelector } from "./MediumSelector";
import { SmsInput } from "./Mediums/SmsInput";
import { SlackInput } from "./Mediums/SlackInput";
import { WhatsappInput } from "./Mediums/WhatsappInput";
import { WaitTimeInput } from "./Mediums/WaitTimeInput";
import { AdvancedOptions } from "./AdvancedOptions";
import CreateButton from "../shared/CreateButton";
import { Medium } from "../../types/backend-frontend";
import { CallInput } from "./Mediums/CallInput";
import { DashboardInput } from "./Mediums/DashboardInput";

export function mapUiChannelToMedium(
  uc: ConfigureIcState["uiChannel"],
  ownTwilio: boolean,
  ownSlack: boolean,
): Medium {
  if (uc === "slack") {
    return ownSlack ? "slack" : "slack_poku";
  } else if (uc === "whatsapp") {
    return ownTwilio ? "whatsapp" : "whatsapp_poku";
  } else if (uc === "sms") {
    return ownTwilio ? "sms" : "sms_poku";
  } else if (uc === "call") {
    return "call_poku";
  } else if (uc === "dashboard") {
    return "dashboard_poku";
  } else {
    throw new Error("Couldn't find uiChannel");
  }
}

export const mediumToUiChannelMap: Record<Medium, string> = {
  slack_poku: "Slack",
  slack: "Slack",
  whatsapp_poku: "WhatsApp",
  whatsapp: "WhatsApp",
  call_poku: "Call",
  sms: "SMS",
  sms_poku: "SMS",
  dashboard_poku: "Dashboard",
};

export type ConfigureIcState = {
  uiChannel: "slack" | "whatsapp" | "sms" | "call" | "dashboard";
  usingOwnTwilio: boolean;
  usingOwnSlack: boolean;
  humanNumber: string;
  agentNumber: string;
  waitTime: number;
  webhook?: string;
  validTimeSeconds?: number;
  linkEnabled?: boolean;
  messageTemplate?: string;
  responseTemplate?: string;
  noResponseTemplate?: string;
};

function HumanAsATool() {
  const { sid, authToken } = useTwilio();

  const [form, setForm] = useState<ConfigureIcState>({
    uiChannel: "sms",
    usingOwnTwilio: false,
    usingOwnSlack: false,
    humanNumber: "",
    agentNumber: "",
    waitTime: 60,
    webhook: undefined,
    validTimeSeconds: undefined,
    linkEnabled: false,
    messageTemplate: undefined,
    responseTemplate: undefined,
    noResponseTemplate: undefined,
  });

  const listRef = useRef<{ reload: () => void }>(null);

  const handleSave = async () => {
    const shouldSendAgentNumber =
      (form.uiChannel === "slack" && form.usingOwnSlack) ||
      (form.uiChannel === "sms" && form.usingOwnTwilio) ||
      (form.uiChannel === "whatsapp" && form.usingOwnTwilio);
    await apiClient.createInteractionChannel(
      form.uiChannel === "dashboard" ? "Dashboard" : form.humanNumber,
      shouldSendAgentNumber ? form.agentNumber.replace("whatsapp:", "") : "",
      form.uiChannel !== "call" && form.uiChannel !== "dashboard" ? form.waitTime : undefined,
      mapUiChannelToMedium(
        form.uiChannel,
        form.usingOwnTwilio,
        form.usingOwnSlack,
      ),
      form.webhook,
      form.validTimeSeconds,
      form.linkEnabled,
      form.messageTemplate,
      form.responseTemplate,
      form.noResponseTemplate,
    );
    listRef.current?.reload();
  };

  return (
    <Box
      sx={{
        maxWidth: 948,
      }}
    >
      <Stack spacing={3} sx={{ mt: 2 }}>
        <MediumSelector
          uiChannel={form.uiChannel}
          setUiChannel={(val) =>
            setForm((prev) => ({
              ...prev,
              uiChannel: val,
              // Default to 1 hour for dashboard
              validTimeSeconds: val === "dashboard" ? (prev.validTimeSeconds ?? 3600) : prev.validTimeSeconds,
            }))
          }
        />

        {form.uiChannel === "slack" && (
          <SlackInput
            value={{
              usingOwnSlack: form.usingOwnSlack,
              agentNumber: form.agentNumber,
              humanNumber: form.humanNumber,
            }}
            onChange={({ usingOwnSlack, agentNumber, humanNumber }) =>
              setForm((prev) => ({
                ...prev,
                usingOwnSlack,
                agentNumber,
                humanNumber,
              }))
            }
          />
        )}
        {form.uiChannel === "sms" && (
          <SmsInput
            usingOwnTwilio={form.usingOwnTwilio}
            setUsingOwnTwilio={(val) =>
              setForm((prev) => ({ ...prev, usingOwnTwilio: val }))
            }
            onChange={(val) =>
              setForm((prev) => ({ ...prev, humanNumber: val }))
            }
            agentNumber={form.agentNumber}
            setAgentNumber={(val) =>
              setForm((prev) => ({ ...prev, agentNumber: val }))
            }
          />
        )}
        {form.uiChannel === "whatsapp" && (
          <WhatsappInput
            usingOwnTwilio={form.usingOwnTwilio}
            setUsingOwnTwilio={(val) =>
              setForm((prev) => ({ ...prev, usingOwnTwilio: val }))
            }
            onChange={(val) =>
              setForm((prev) => ({ ...prev, humanNumber: val }))
            }
            agentNumber={form.agentNumber}
            setAgentNumber={(val) =>
              setForm((prev) => ({ ...prev, agentNumber: val }))
            }
          />
        )}
        {form.uiChannel === "call" && (
          <CallInput
            onChange={(val) =>
              setForm((prev) => ({ ...prev, humanNumber: val }))
            }
          />
        )}

        {form.uiChannel === "dashboard" && (
          <DashboardInput
            webhook={form.webhook}
            setWebhook={(val) => setForm((prev) => ({ ...prev, webhook: val }))}
            validTimeSeconds={form.validTimeSeconds}
            setValidTimeSeconds={(val) =>
              setForm((prev) => ({ ...prev, validTimeSeconds: val }))
            }
          />
        )}

        {form.uiChannel !== "call" && form.uiChannel !== "dashboard" && (
          <WaitTimeInput
            value={form.waitTime}
            onChange={(val) => setForm((prev) => ({ ...prev, waitTime: val }))}
          />
        )}

        {(form.uiChannel === "sms" ||
          form.uiChannel === "whatsapp") && (
          <AdvancedOptions
            webhook={form.webhook}
            setWebhook={(val) => setForm((prev) => ({ ...prev, webhook: val }))}
            setValidTimeSeconds={(val) =>
              setForm((prev) => ({ ...prev, validTimeSeconds: val }))
            }
            validTimeSeconds={form.validTimeSeconds}
            linkEnabled={form.linkEnabled}
            setLinkEnabled={(val) =>
              setForm((prev) => ({ ...prev, linkEnabled: val }))
            }
            messageTemplate={form.messageTemplate}
            responseTemplate={form.responseTemplate}
            noResponseTemplate={form.noResponseTemplate}
            setMessageTemplate={(val) =>
              setForm((prev) => ({ ...prev, messageTemplate: val }))
            }
            setResponseTemplate={(val) =>
              setForm((prev) => ({ ...prev, responseTemplate: val }))
            }
            setNoResponseTemplate={(val) =>
              setForm((prev) => ({ ...prev, noResponseTemplate: val }))
            }
            uiChannel={form.uiChannel}
          />
        )}
        {form.uiChannel === "slack" && (
          <AdvancedOptions
            webhook={form.webhook}
            setWebhook={(val) => setForm((prev) => ({ ...prev, webhook: val }))}
            setValidTimeSeconds={(val) =>
              setForm((prev) => ({ ...prev, validTimeSeconds: val }))
            }
            validTimeSeconds={form.validTimeSeconds}
            linkEnabled={form.linkEnabled}
            setLinkEnabled={(val) =>
              setForm((prev) => ({ ...prev, linkEnabled: val }))
            }
            showFollowUp={false}
            showWebhook={false}
            messageTemplate={form.messageTemplate}
            responseTemplate={form.responseTemplate}
            noResponseTemplate={form.noResponseTemplate}
            setMessageTemplate={(val) =>
              setForm((prev) => ({ ...prev, messageTemplate: val }))
            }
            setResponseTemplate={(val) =>
              setForm((prev) => ({ ...prev, responseTemplate: val }))
            }
            setNoResponseTemplate={(val) =>
              setForm((prev) => ({ ...prev, noResponseTemplate: val }))
            }
            uiChannel={form.uiChannel}
          />
        )}

        <Stack gap={1}>
          <CreateButton
            onCreate={handleSave}
            disabled={
              (form.uiChannel !== "dashboard" && !form.humanNumber) ||
              (form.uiChannel === "dashboard" && !form.webhook) ||
              (form.uiChannel === "sms" &&
                form.usingOwnTwilio &&
                !form.agentNumber) ||
              (form.uiChannel === "whatsapp" &&
                form.usingOwnTwilio &&
                !form.agentNumber) ||
              (form.uiChannel === "slack" &&
                form.usingOwnSlack &&
                !form.agentNumber) ||
              (form.uiChannel === "sms" && form.usingOwnTwilio && !sid) ||
              (form.uiChannel === "sms" && form.usingOwnTwilio && !authToken) ||
              (form.uiChannel === "whatsapp" && form.usingOwnTwilio && !sid) ||
              (form.uiChannel === "whatsapp" &&
                form.usingOwnTwilio &&
                !authToken)
            }
          >
            Create
          </CreateButton>
        </Stack>

        <Divider />

        <ListInteractionChannels ref={listRef} />
      </Stack>
    </Box>
  );
}
export default withLoggedIn(HumanAsATool);
