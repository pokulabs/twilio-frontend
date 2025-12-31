import { Box, Typography } from "@mui/joy";
import { InfoTooltip } from "../shared/InfoTooltip";
import { DurationInput } from "../shared/DurationInput";

export function WaitTimeInput(props: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <Box>
      <DurationInput
        value={props.value}
        onChange={(val) => props.onChange(val || 0)}
        label={
          <Typography
            level="title-md"
            endDecorator={
              <InfoTooltip
                title={
                  <Typography>
                    How long should the AI agent wait for a response from the
                    human? If available, set your AI agent's tool connection
                    timeout to at least this long.
                  </Typography>
                }
              />
            }
          >
            Wait Time
          </Typography>
        }
      />
    </Box>
  );
}
