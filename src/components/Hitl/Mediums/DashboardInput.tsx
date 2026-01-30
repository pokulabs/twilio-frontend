import { useState } from "react";
import { Box, Input, Stack, Typography } from "@mui/joy";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { DurationInput } from "../../shared/DurationInput";
import { apiClient } from "../../../api-client";
import CreateButton from "../../shared/CreateButton";

export function DashboardInput({ onSaved }: { onSaved?: () => void }) {
  const [webhook, setWebhook] = useState<string | undefined>();
  const [validTimeSeconds, setValidTimeSeconds] = useState<number | undefined>(3600);

  const isValid = !!webhook;

  const handleSave = async () => {
    await apiClient.createInteractionChannel({
      humanNumber: "Dashboard",
      medium: "dashboard_poku",
      webhook,
      validTime: validTimeSeconds,
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
                  The human's response and any metadata will be sent to this
                  webhook URL. Required for the Dashboard medium.
                </Typography>
              }
            />
          }
        >
          Webhook URL
        </Typography>
        <Input
          placeholder="https://cloud.n8n.com/webhook/a0e934fe-5920-49f1-8821-1b7ffc312573"
          value={webhook || ""}
          onChange={(e) => setWebhook(e.target.value || undefined)}
        />
      </Box>
      <Box>
        <DurationInput
          value={validTimeSeconds}
          onChange={(val) => setValidTimeSeconds(val)}
          label={
            <Typography
              level="title-md"
              endDecorator={
                <InfoTooltip
                  title={
                    <Typography>
                      How long to listen for a response before the interaction
                      expires.
                    </Typography>
                  }
                />
              }
            >
              Listen Duration
            </Typography>
          }
        />
      </Box>

      <Stack gap={1}>
        <CreateButton onCreate={handleSave} disabled={!isValid}>
          Create
        </CreateButton>
      </Stack>
    </>
  );
}
