import { useRef, useState } from "react";
import { Stack, Box, Divider } from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import withLoggedIn from "../../context/withLoggedIn";
import { ListInteractionChannels } from "./ListInteractionChannels";
import { MediumSelector } from "./MediumSelector";
import { SmsInput } from "./SmsInput";
import { SlackInput } from "./SlackInput";
import { WhatsappInput } from "./WhatsappInput";
import { WaitTimeInput } from "./WaitTimeInput";
import { AdvancedOptions } from "./AdvancedOptions";
import CreateButton from "../shared/CreateButton";
import { Medium } from "../../types/backend-frontend";

export function mapUiChannelToMedium(
  uc: ConfigureIcState["uiChannel"],
  ownTwilio: boolean,
): Medium {
  if (uc === "slack") {
    return "slack_poku";
  } else if (uc === "whatsapp") {
    return "whatsapp_poku";
  } else if (uc === "sms") {
    if (ownTwilio) {
      return "sms";
    } else {
      return "sms_poku";
    }
  } else if (uc === "call") {
    return "call_poku";
  }
  else {
    throw new Error("Couldn't find uiChannel");
  }
}

export const mediumToUiChannelMap: Record<Medium, string> = {
  slack_poku: "Slack",
  whatsapp_poku: "WhatsApp",
  call_poku: "Call",
  sms: "SMS",
  sms_poku: "SMS",
};

export type ConfigureIcState = {
  uiChannel: "slack" | "whatsapp" | "sms" | "call";
  usingOwnTwilio: boolean;
  humanNumber: string;
  agentNumber: string;
  waitTime: number;
  webhook?: string;
  validTimeSeconds?: number;
};

function HumanAsATool() {
  const {
    phoneNumbers,
    whatsappNumbers,
    isAuthenticated: hasTwilioCreds,
    sid,
    authToken,
  } = useTwilio();

  const [form, setForm] = useState<ConfigureIcState>({
    uiChannel: "sms",
    usingOwnTwilio: false,
    humanNumber: "",
    agentNumber: "",
    waitTime: 60,
    webhook: undefined,
    validTimeSeconds: undefined,
  });

  const listRef = useRef<{ reload: () => void }>(null);

  const handleSave = async () => {
    await apiClient.createInteractionChannel(
      form.humanNumber,
      form.usingOwnTwilio ? form.agentNumber : "",
      form.uiChannel !== "call" ? form.waitTime : undefined,
      mapUiChannelToMedium(form.uiChannel, form.usingOwnTwilio),
      form.webhook,
      form.validTimeSeconds,
    );
    listRef.current?.reload();
  };

  return (
    <Box
      sx={{
        maxWidth: 782,
      }}
    >
      <Stack spacing={3} sx={{ mt: 2 }}>
        <MediumSelector
          uiChannel={form.uiChannel}
          setUiChannel={(val) =>
            setForm((prev) => ({ ...prev, uiChannel: val }))
          }
        />

        {form.uiChannel === "slack" && (
          <SlackInput onChange={(val) => setForm((prev) => ({ ...prev, humanNumber: val }))} />
        )}
        {form.uiChannel === "sms" && (
          <SmsInput
            usingOwnTwilio={form.usingOwnTwilio}
            setUsingOwnTwilio={(val) =>
              setForm((prev) => ({ ...prev, usingOwnTwilio: val }))
            }
            onChange={(val) => setForm((prev) => ({ ...prev, humanNumber: val }))}
            agentNumber={form.agentNumber}
            setAgentNumber={(val) =>
              setForm((prev) => ({ ...prev, agentNumber: val }))
            }
            hasTwilioCreds={hasTwilioCreds}
            phoneNumbers={phoneNumbers}
            whatsappNumbers={whatsappNumbers}
          />
        )}
        {form.uiChannel === "whatsapp" && (
          <WhatsappInput
            onChange={(val) => setForm((prev) => ({ ...prev, humanNumber: val }))}
          />
        )}
        {form.uiChannel === "call" && (
          <WhatsappInput onChange={(val) => setForm((prev) => ({ ...prev, humanNumber: val }))} />
        )}

        {form.uiChannel !== "call" && (
          <WaitTimeInput
            value={form.waitTime}
            onChange={(val) => setForm((prev) => ({ ...prev, waitTime: val }))}
          />
        )}

        {(form.uiChannel === "sms" || form.uiChannel === "whatsapp") && (
          <AdvancedOptions
            webhook={form.webhook}
            setWebhook={(val) =>
              setForm((prev) => ({ ...prev, webhook: val }))
            }
            setValidTimeSeconds={(val) =>
              setForm((prev) => ({ ...prev, validTimeSeconds: val }))
            }
          />
        )}

        <Stack gap={1}>
          <CreateButton
            onCreate={handleSave}
            disabled={
              !form.humanNumber ||
              (!form.agentNumber && form.usingOwnTwilio) ||
              (!sid && form.usingOwnTwilio) ||
              (!authToken && form.usingOwnTwilio)
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
