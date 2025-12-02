import {Box, Typography} from "@mui/material"
import { useRef } from "react";
import { InfoTooltip } from "../shared/InfoTooltip";
import { CreateTextField } from "../shared/CreateTextField";

export function WaitTimeInput(props: {
  value: number;
  onChange: (val: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Box sx={{display: "flex", alignItems: "center", gap: 0.5, mb: 1}}>
        <Typography
          variant="subtitle1"
        >
          Wait Time (seconds)
        </Typography>
          <InfoTooltip
            title={
              <Typography variant="body2">
                How long (in seconds) should the AI agent wait for a response
                from the human? If available, set your AI agent"s tool
                connection timeout to at least this long.
              </Typography>
            }
            />
        </Box>

      <CreateTextField
        type="number"
        value={props.value}
        onChange={(e) => props.onChange(+e.target.value)}
        inputRef={inputRef}
        slotProps={{
          htmlInput: {
            min: 1,
            max: 600,
          },
        }}
      />
    </Box>
  );
}
