import { useState } from "react";
import { Box, Checkbox, Option, Select, Stack, Typography } from "@mui/joy";
import { Link as RLink } from "react-router-dom";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { useTwilio } from "../../../context/TwilioProvider";
import { HumanNumberInput } from "./HumanNumberInput";
import { AdvancedOptions } from "../AdvancedOptions";
import { WaitTimeInput } from "./WaitTimeInput";
import { apiClient } from "../../../api-client";
import CreateButton from "../../shared/CreateButton";

export function WhatsappInput({ onSaved }: { onSaved?: () => void }) {
  const {
    whatsappNumbers,
    isAuthenticated: hasTwilioCreds,
    sid,
    authToken,
  } = useTwilio();

  const [usingOwnTwilio, setUsingOwnTwilio] = useState(false);
  const [agentNumber, setAgentNumber] = useState("");
  const [humanNumber, setHumanNumber] = useState("");
  const [waitTime, setWaitTime] = useState(60);

  // Advanced options state
  const [webhook, setWebhook] = useState<string | undefined>();
  const [validTimeSeconds, setValidTimeSeconds] = useState<number | undefined>(86400);
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState<string | undefined>();
  const [responseTemplate, setResponseTemplate] = useState<string | undefined>();
  const [noResponseTemplate, setNoResponseTemplate] = useState<string | undefined>();

  const isValid = (() => {
    if (!humanNumber) return false;
    if (usingOwnTwilio && (!agentNumber || !sid || !authToken)) return false;
    return true;
  })();

  const handleSave = async () => {
    await apiClient.createInteractionChannel({
      humanNumber,
      medium: usingOwnTwilio ? "whatsapp" : "whatsapp_poku",
      agentNumber: usingOwnTwilio ? agentNumber.replace("whatsapp:", "") : undefined,
      waitTime,
      webhook,
      validTime: validTimeSeconds,
      linkEnabled,
      messageTemplate,
      responseTemplate,
      noResponseTemplate,
    });
    onSaved?.();
  };

  return (
    <>
      <Box>
        <Checkbox
          label="Send from my own Twilio number"
          checked={usingOwnTwilio}
          onChange={(e) => setUsingOwnTwilio(e.target.checked)}
        />

        {usingOwnTwilio && !hasTwilioCreds && (
          <Typography color="danger">
            Please go to <RLink to="/integrations">Integrations</RLink> to add
            your Twilio credentials and use your own number.
          </Typography>
        )}

        {usingOwnTwilio && hasTwilioCreds && (
          <Select
            placeholder="Choose a number"
            value={agentNumber || ""}
            onChange={(_event, newPhoneNumber) =>
              setAgentNumber(newPhoneNumber || "")
            }
          >
            {whatsappNumbers.map((e) => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>
        )}
      </Box>

      <Box>
        <Typography
          level="title-md"
          endDecorator={
            <InfoTooltip
              title={
                <Typography>
                  This is the human your AI will reach out to in case of an
                  interaction.
                </Typography>
              }
            />
          }
        >
          Human Number
        </Typography>

        <HumanNumberInput onChange={setHumanNumber} />
      </Box>

      <WaitTimeInput value={waitTime} onChange={setWaitTime} />

      <AdvancedOptions
        webhook={webhook}
        setWebhook={setWebhook}
        validTimeSeconds={validTimeSeconds}
        setValidTimeSeconds={setValidTimeSeconds}
        linkEnabled={linkEnabled}
        setLinkEnabled={setLinkEnabled}
        messageTemplate={messageTemplate}
        setMessageTemplate={setMessageTemplate}
        responseTemplate={responseTemplate}
        setResponseTemplate={setResponseTemplate}
        noResponseTemplate={noResponseTemplate}
        setNoResponseTemplate={setNoResponseTemplate}
        uiChannel="whatsapp"
      />

      <Stack gap={1}>
        <CreateButton onCreate={handleSave} disabled={!isValid}>
          Create
        </CreateButton>
      </Stack>
    </>
  );
}
