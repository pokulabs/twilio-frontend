import {
  Box,
  Checkbox,
  Divider,
  Input,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { useState } from "react";
import { InfoTooltip } from "../shared/InfoTooltip";
import type { ConfigureIcState } from "./HumanAsATool";
import { DurationInput } from "../shared/DurationInput";

export type AdvancedOptionsProps = {
  webhook?: string;
  setWebhook: (val: string | undefined) => void;
  setValidTimeSeconds: (val: number | undefined) => void;
  validTimeSeconds?: number;
  linkEnabled?: boolean;
  setLinkEnabled?: (val: boolean) => void;
  showFollowUp?: boolean;
  showWebhook?: boolean;
  messageTemplate?: string;
  responseTemplate?: string;
  noResponseTemplate?: string;
  setMessageTemplate: (val: string | undefined) => void;
  setResponseTemplate: (val: string | undefined) => void;
  setNoResponseTemplate: (val: string | undefined) => void;
  uiChannel?: ConfigureIcState["uiChannel"];
};

export function AdvancedOptions({
  webhook,
  setWebhook,
  setValidTimeSeconds,
  validTimeSeconds,
  linkEnabled,
  setLinkEnabled,
  showFollowUp = true,
  showWebhook = true,
  messageTemplate,
  responseTemplate,
  noResponseTemplate,
  setMessageTemplate,
  setResponseTemplate,
  setNoResponseTemplate,
  uiChannel,
}: AdvancedOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Box>
      <Box
        onClick={() => setShowAdvanced((s) => !s)}
        sx={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {showAdvanced ? (
          <KeyboardArrowDown fontSize="small" />
        ) : (
          <KeyboardArrowRight fontSize="small" />
        )}
        <Typography level="body-sm">Advanced options</Typography>
      </Box>
      {showAdvanced && (
        <Stack gap={1.5} sx={{ mt: 1 }}>
          <Box>
            <Checkbox
              label={
                <Typography level="body-sm">Include reply link</Typography>
              }
              checked={!!linkEnabled}
              onChange={(e) => setLinkEnabled?.(e.target.checked)}
            />
          </Box>
          <Stack direction="row" gap={1.5}>
            {showFollowUp && (
              <Box sx={{ flex: 1 }}>
                <Typography
                  level="body-sm"
                  sx={{ mb: 0.5 }}
                  endDecorator={
                    <InfoTooltip
                      title={
                        <Typography>
                          After the tool call timeout expires, the AI agent will
                          wait for a response from the human for this duration.
                        </Typography>
                      }
                    />
                  }
                >
                  Follow-up time (optional)
                </Typography>
                <DurationInput
                  value={validTimeSeconds}
                  onChange={setValidTimeSeconds}
                />
              </Box>
            )}
            {showWebhook && (
              <Box sx={{ flex: 3 }}>
                <Typography
                  level="body-sm"
                  sx={{ mb: 0.5 }}
                  endDecorator={
                    <InfoTooltip
                      title={
                        <Typography>
                          The human's response and any metadata will be sent to
                          this webhook URL.
                        </Typography>
                      }
                    />
                  }
                >
                  Webhook URL (optional)
                </Typography>
                <Input
                  placeholder="https://cloud.n8n.com/webhook/a0e934fe-5920-49f1-8821-1b7ffc312573"
                  value={webhook || ""}
                  onChange={(e) => setWebhook(e.target.value || undefined)}
                />
              </Box>
            )}
          </Stack>
          <Divider />
          {uiChannel !== "whatsapp" && (
            <Box>
              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                Outgoing message template
              </Typography>
              <Textarea
                maxRows={5}
                placeholder={`Request from AI agent. Expires in {{waitTime}} seconds:\n\n{{message}}`}
                value={messageTemplate ?? ""}
                onChange={(e) =>
                  setMessageTemplate?.(e.target.value || undefined)
                }
              />
            </Box>
          )}
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Response template
            </Typography>
            <Textarea
              maxRows={5}
              placeholder="Human response: {{message}}"
              value={responseTemplate ?? ""}
              onChange={(e) =>
                setResponseTemplate?.(e.target.value || undefined)
              }
            />
          </Box>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              No-response template
            </Typography>
            <Textarea
              maxRows={5}
              placeholder="Human did not respond. Continue where you left off."
              value={noResponseTemplate ?? ""}
              onChange={(e) =>
                setNoResponseTemplate?.(e.target.value || undefined)
              }
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
}

export default AdvancedOptions;
