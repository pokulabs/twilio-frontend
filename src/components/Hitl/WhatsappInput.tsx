import { Box, Input, Typography } from "@mui/joy";
import { InfoTooltip } from "../shared/InfoTooltip";

export function WhatsappInput({
  value,
  onChange,
}: {
  value: string;
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

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value || "")}
        placeholder="Ex: +12223334444"
      />
    </Box>
  );
}
