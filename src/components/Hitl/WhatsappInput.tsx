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
  );
}
