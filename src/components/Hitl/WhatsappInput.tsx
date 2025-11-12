import { Box, Typography } from "@mui/joy";
import { InfoTooltip } from "../shared/InfoTooltip";
import { HumanNumberInput } from "../shared/HumanNumberInput";

export function WhatsappInput({
  onChange,
}: {
  onChange: (val: string) => void;
}) {
  return (
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

      <HumanNumberInput onChange={onChange} />
    </Box>
  );
}
