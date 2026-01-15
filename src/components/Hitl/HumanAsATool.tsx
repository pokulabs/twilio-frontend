import { useRef, useState } from "react";
import { Stack, Box, Divider } from "@mui/joy";
import withLoggedIn from "../../context/withLoggedIn";
import { ListInteractionChannels } from "./ListInteractionChannels";
import { MediumSelector } from "./MediumSelector";
import { SmsInput } from "./Mediums/SmsInput";
import { SlackInput } from "./Mediums/SlackInput";
import { WhatsappInput } from "./Mediums/WhatsappInput";
import { CallInput } from "./Mediums/CallInput";
import { DashboardInput } from "./Mediums/DashboardInput";
import { Medium } from "../../types/backend-frontend";

type UiChannel = "slack" | "whatsapp" | "sms" | "call" | "dashboard";

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

// Keep ConfigureIcState for backwards compatibility with AdvancedOptions
export type ConfigureIcState = {
  uiChannel: UiChannel;
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
  const [uiChannel, setUiChannel] = useState<UiChannel>("sms");
  const listRef = useRef<{ reload: () => void }>(null);

  const handleSaved = () => {
    listRef.current?.reload();
  };

  return (
    <Box sx={{ maxWidth: 948 }}>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <MediumSelector uiChannel={uiChannel} setUiChannel={setUiChannel} />

        {uiChannel === "sms" && <SmsInput onSaved={handleSaved} />}
        {uiChannel === "whatsapp" && <WhatsappInput onSaved={handleSaved} />}
        {uiChannel === "slack" && <SlackInput onSaved={handleSaved} />}
        {uiChannel === "call" && <CallInput onSaved={handleSaved} />}
        {uiChannel === "dashboard" && <DashboardInput onSaved={handleSaved} />}

        <Divider />

        <ListInteractionChannels ref={listRef} />
      </Stack>
    </Box>
  );
}

export default withLoggedIn(HumanAsATool);
