import {Box, MenuItem, Select, Typography } from "@mui/material";
import { Link as RLink } from "react-router-dom";
import { InfoTooltip } from "../shared/InfoTooltip";
import { useTwilio } from "../../context/TwilioProvider";
import { HumanNumberInput } from "../shared/HumanNumberInput";
import CreateCheckbox from "../shared/CreateCheckbox";

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
        <CreateCheckbox 
        label="Send from my own Twilio number"
          checkboxProps={{
            checked: usingOwnTwilio,
            onChange: (e) => setUsingOwnTwilio(e.target.checked)
          }}
        />

        {usingOwnTwilio && hasTwilioCreds && (
          <Typography color="danger">
            Please go to <RLink to="/integrations">Integrations</RLink> to add
            your Twilio credentials and use your own number.
          </Typography>
        )}

        {usingOwnTwilio && !hasTwilioCreds && (
          <Select
            value={agentNumber || ""}
            onChange={(e) => setAgentNumber(e.target.value)}
            fullWidth
            size="small"
            displayEmpty
            sx={{
              "&.MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "primary.light"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main"
                }
              },
            }}
            renderValue={(selected) => {
              if (!selected) {
                return <Typography >Choose a number</Typography>;
              }
              return selected;
            }}
          >
            {phoneNumbers.concat(whatsappNumbers).map((e) => (
              <MenuItem key={e} value={e}>
                {e}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>
      <Box>
        <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
          <Typography
            variant="subtitle1"
            >
            Human Number
          </Typography>
          <InfoTooltip
            size="small"
            title={
              <Typography variant="body2">
                This is the human your AI will reach out to in case of an
                interaction.
              </Typography>
            }
            />
        </Box>
        <HumanNumberInput onChange={onChange} />
      </Box>
    </>
  );
}
