import { Box, Checkbox, Option, Select, Typography } from "@mui/joy";
import { Link as RLink } from "react-router-dom";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { useTwilio } from "../../../context/TwilioProvider";
import { HumanNumberInput } from "./HumanNumberInput";

export function SmsInput({
  onChange,
  usingOwnTwilio,
  setUsingOwnTwilio,
  agentNumber,
  setAgentNumber,
}: {
  onChange: (val: string) => void;
  usingOwnTwilio: boolean;
  setUsingOwnTwilio: (val: boolean) => void;
  agentNumber: string;
  setAgentNumber: (val: string) => void;
}) {
  const {
    phoneNumbers,
    whatsappNumbers,
    isAuthenticated: hasTwilioCreds,
  } = useTwilio();

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
                  This is the human your AI will reach out to in case of an
                  interaction.
                </Typography>
              }
            />
          }
        >
          Human Number
        </Typography>

        <HumanNumberInput onChange={onChange} />
      </Box>
    </>
  );
}
