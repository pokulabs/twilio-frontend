import { Box, Input, Typography } from "@mui/joy";
import { useRef } from "react";
import { InfoTooltip } from "../shared/InfoTooltip";

export function WaitTimeInput(props: {
  value: number;
  onChange: (val: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Typography
        level="title-md"
        endDecorator={
          <InfoTooltip
            title={
              <Typography>
                How long (in seconds) should the AI agent wait for a response
                from the human? If available, set your AI agent"s tool
                connection timeout to at least this long.
              </Typography>
            }
          />
        }
      >
        Wait Time (seconds)
      </Typography>
      <Input
        type="number"
        value={props.value}
        onChange={(e) => props.onChange(+e.target.value)}
        slotProps={{
          input: {
            ref: inputRef,
            min: 1,
            max: 600,
          },
        }}
      />
    </Box>
  );
}


