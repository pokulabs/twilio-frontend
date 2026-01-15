import { Box, Input, Typography } from "@mui/joy";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { DurationInput } from "../../shared/DurationInput";

export function DashboardInput({
  webhook,
  setWebhook,
  validTimeSeconds,
  setValidTimeSeconds,
}: {
  webhook: string | undefined;
  setWebhook: (val: string | undefined) => void;
  validTimeSeconds: number | undefined;
  setValidTimeSeconds: (val: number | undefined) => void;
}) {
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
                      expires. Leave empty for no expiration.
                    </Typography>
                  }
                />
              }
            >
              Listen Duration (optional)
            </Typography>
          }
        />
      </Box>
    </>
  );
}

