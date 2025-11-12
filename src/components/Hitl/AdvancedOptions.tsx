import {
  Box,
  Checkbox,
  Divider,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { InfoTooltip } from "../shared/InfoTooltip";

type TimeUnit = "seconds" | "minutes" | "hours" | "days";

export type AdvancedOptionsProps = {
  webhook?: string;
  setWebhook: (val: string | undefined) => void;
  setValidTimeSeconds: (val: number | undefined) => void;
  linkEnabled?: boolean;
  setLinkEnabled?: (val: boolean) => void;
  showFollowUp?: boolean;
  showWebhook?: boolean;
};

export function AdvancedOptions({
  webhook,
  setWebhook,
  setValidTimeSeconds,
  linkEnabled,
  setLinkEnabled,
  showFollowUp = true,
  showWebhook = true,
}: AdvancedOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<TimeUnit>("minutes");
  const [amount, setAmount] = useState("");

  const unitToSeconds: Record<TimeUnit, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
  };

  const derivedSeconds = useMemo(() => {
    if (amount === "") return undefined;
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return undefined;
    return numeric * unitToSeconds[currentUnit];
  }, [amount, currentUnit]);

  useEffect(() => {
    setValidTimeSeconds(derivedSeconds);
  }, [derivedSeconds]);

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
              label="Include reply link"
              checked={!!linkEnabled}
              onChange={(e) => setLinkEnabled?.(e.target.checked)}
            />
          </Box>
          {showFollowUp && (
            <Box>
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
              <Input
                type="number"
                placeholder="30"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                endDecorator={
                  <>
                    <Divider orientation="vertical" />
                    <Select
                      value={currentUnit}
                      variant="plain"
                      onChange={(_, next) =>
                        setCurrentUnit((next ?? "seconds") as TimeUnit)
                      }
                      slotProps={{
                        listbox: {
                          variant: "outlined",
                        },
                      }}
                      sx={{ mr: -1.5, "&:hover": { bgcolor: "transparent" } }}
                    >
                      <Option value="seconds">seconds</Option>
                      <Option value="minutes">minutes</Option>
                      <Option value="hours">hours</Option>
                      <Option value="days">days</Option>
                    </Select>
                  </>
                }
              />
            </Box>
          )}
          {showWebhook && (
            <Box>
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
      )}
    </Box>
  );
}

export default AdvancedOptions;
