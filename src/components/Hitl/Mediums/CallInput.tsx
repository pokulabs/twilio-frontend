import { useState } from "react";
import { Box, Stack, Typography } from "@mui/joy";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { HumanNumberInput } from "./HumanNumberInput";
import { apiClient } from "../../../api-client";
import CreateButton from "../../shared/CreateButton";

export function CallInput({ onSaved }: { onSaved?: () => void }) {
  const [humanNumber, setHumanNumber] = useState("");

  const isValid = !!humanNumber;

  const handleSave = async () => {
    await apiClient.createInteractionChannel({
      humanNumber,
      medium: "call_poku",
    });
    onSaved?.();
  };

  return (
    <>
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

        <HumanNumberInput onChange={setHumanNumber} />
      </Box>

      <Stack gap={1}>
        <CreateButton onCreate={handleSave} disabled={!isValid}>
          Create
        </CreateButton>
      </Stack>
    </>
  );
}
