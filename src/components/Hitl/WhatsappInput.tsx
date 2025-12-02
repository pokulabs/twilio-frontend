import { Box, Typography } from "@mui/material";
import { InfoTooltip } from "../shared/InfoTooltip";
import { CreateTextField } from "../shared/CreateTextField";
import { HumanNumberInput } from "../shared/HumanNumberInput";

export function WhatsappInput({
  onChange,
}: {
  onChange: (val: string) => void;
}) {
  return (
    <Box>
      <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
        <Typography
          variant="subtitle1"
          >
          Human Number
        </Typography>
          <InfoTooltip
            title={
              <Typography variant="body2">
                This is the human your AI will reach out to in case of an
                interaction.
              </Typography>
            }
            />
        </Box>


      <HumanNumberInput onChange={onChange}/>
    </Box>
  );
}
