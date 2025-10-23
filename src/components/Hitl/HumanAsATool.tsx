import { useRef, useState } from "react";
import { Button, Typography, Stack, Box, Divider } from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import withLoggedIn from "../../context/withLoggedIn";
import { ListInteractionChannels } from "./ListInteractionChannels";
import { Usage } from "../shared/Usage";
import { MediumSelector } from "./MediumSelector";
import { SmsInput } from "./SmsInput";
import { SlackInput } from "./SlackInput";
import { WhatsappInput } from "./WhatsappInput";
import { WaitTimeInput } from "./WaitTimeInput";
import type { Medium } from "../../types";


export type UiChannel = "slack" | "whatsapp" | "sms";

export function mapUiChannelToMedium(uc: UiChannel, ownTwilio: boolean): Medium {
  if (uc === "slack") {
    return uc;
  } else if (uc === "whatsapp") {
    return "whatsapp_poku";
  } else if (uc === "sms") {
    if (ownTwilio) {
      return "sms";
    } else {
      return "sms_poku";
    }
  } else {
    throw new Error("Couldn't find uiChannel");
  }
}

function HumanAsATool() {
  const { phoneNumbers, whatsappNumbers, isAuthenticated: hasTwilioCreds, sid, authToken } = useTwilio();

  const [agentNumber, setAgentNumber] = useState("");
  const [hostedAgentNumber] = useState("+16286001841");
  const [waitTime, setWaitTime] = useState(60);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const [uiChannel, setUiChannel] = useState<UiChannel>("sms");
  const [usingOwnTwilio, setUsingOwnTwilio] = useState(false);
  const [humanNumbers, setHumanNumbers] = useState<{
    slack?: string;
    whatsapp?: string;
    sms?: string;
  }>({});
  const currentHumanNumber = humanNumbers[uiChannel] || "";
  const updateHumanNumber = (val: string) => {
    setHumanNumbers((prev) => ({ ...prev, [uiChannel]: val }));
  };

  const listRef = useRef<{ reload: () => void }>(null);

  // Usage information is displayed via the shared <Usage /> component

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await apiClient.saveAccount(
        currentHumanNumber,
        usingOwnTwilio ? agentNumber : hostedAgentNumber,
        waitTime,
        mapUiChannelToMedium(uiChannel, usingOwnTwilio),
      );
      listRef.current?.reload(); // refresh the list

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000); // hide message after 2s
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  return (
    <Box sx={{
      maxWidth: 782,
    }}>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <MediumSelector uiChannel={uiChannel} setUiChannel={setUiChannel} />

        {uiChannel === "slack" ? (
          <SlackInput value={currentHumanNumber} onChange={updateHumanNumber} />
        ) : uiChannel === "sms" ? (
          <SmsInput
            usingOwnTwilio={usingOwnTwilio}
            setUsingOwnTwilio={setUsingOwnTwilio}
            value={currentHumanNumber}
            onChange={updateHumanNumber}
            agentNumber={agentNumber}
            setAgentNumber={setAgentNumber}
            hasTwilioCreds={hasTwilioCreds}
            phoneNumbers={phoneNumbers}
            whatsappNumbers={whatsappNumbers}
          />
        ) : (
          <WhatsappInput
            value={currentHumanNumber}
            onChange={updateHumanNumber}
          />
        )}

        <WaitTimeInput value={waitTime} onChange={(val) => setWaitTime(val)} />

        <Stack gap={1}>
          <Button
            onClick={handleSave}
            disabled={
              !currentHumanNumber ||
              (!agentNumber && usingOwnTwilio) ||
              (!sid && usingOwnTwilio) ||
              (!authToken && usingOwnTwilio) ||
              saveStatus === "saving"
            }
          >
            Create
          </Button>
        </Stack>
        {saveStatus === "success" && (
          <Typography color="success">Settings saved!</Typography>
        )}
        {saveStatus === "error" && (
          <Typography color="danger">Failed to save settings.</Typography>
        )}

        <Divider />

        <ListInteractionChannels ref={listRef} />
      </Stack>

    </Box>
  );
}
export default withLoggedIn(HumanAsATool);