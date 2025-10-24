import { Box, Checkbox, Input, Option, Select, Typography } from "@mui/joy";
import { Link as RLink } from "react-router-dom";
import { InfoTooltip } from "../shared/InfoTooltip";

export function SmsInput({
  onChange,
  usingOwnTwilio,
  setUsingOwnTwilio,
  hasTwilioCreds,
  agentNumber,
  setAgentNumber,
  phoneNumbers,
  whatsappNumbers,
}: {
  onChange: (val: string) => void;
  usingOwnTwilio: boolean;
  setUsingOwnTwilio: (val: boolean) => void;
  hasTwilioCreds: boolean;
  agentNumber: string;
  setAgentNumber: (val: string) => void;
  phoneNumbers: string[];
  whatsappNumbers: string[];
}) {
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
            {phoneNumbers.concat(whatsappNumbers).map((e) => (
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
                  Who would you like your AI agent to reach out to in case of an
                  escalation? Enter the number of the human staff member below.
                  This is the person who will respond to the AI agent in case of
                  an escalation.
                </Typography>
              }
            />
          }
        >
          Human Number
        </Typography>

        <Input
          onChange={(e) => onChange(e.target.value || "")}
          placeholder="Ex: +12223334444"
        />
      </Box>
    </>
  );
}
