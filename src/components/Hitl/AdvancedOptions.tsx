import {Typography, Box, Select, MenuItem, Divider, Stack} from "@mui/material"
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { InfoTooltip } from "../shared/InfoTooltip";
import type { ConfigureIcState } from "./HumanAsATool";
import { CreateTextField } from "../shared/CreateTextField";
import CreateCheckbox from "../shared/CreateCheckbox";

type TimeUnit = "seconds" | "minutes" | "hours" | "days";

export type AdvancedOptionsProps = {
  webhook?: string;
  setWebhook: (val: string | undefined) => void;
  setValidTimeSeconds: (val: number | undefined) => void;
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
        <Typography variant="body2" sx={{color: "grey.600"}}>Advanced options</Typography>
      </Box>
      {showAdvanced && (
        <Stack gap={1.5} sx={{ mt: 1, color: "grey.600" }}>
          <Box>
            <CreateCheckbox 
              label={
                <Typography variant="body2">Include reply link</Typography>
              }
              checkboxProps={{
                checked: !!linkEnabled,
                onChange: (e) => setLinkEnabled?.(e.target.checked)
              }}
            />
          </Box>
          <Stack direction="row" gap={1.5}>
            {showFollowUp && (
              <Box>
                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5 }}
                    >
                      Follow-up time (optional)
                    </Typography>
                    <InfoTooltip
                      size="small"
                      title={
                        <Typography variant="body2">
                          After the tool call timeout expires, the AI agent will
                          wait for a response from the human for this duration.
                        </Typography>
                      }
                      />
                  </Box>
                <CreateTextField
                  type="number"
                  placeholder="30"
                  size="small"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Box sx={{display: "flex", alignItems: "center", height: "100%"}}>
                          <Divider orientation="vertical" flexItem sx={{ mx: 1 }}/>
                          <Select
                            value={currentUnit}
                            variant="standard"
                            onChange={(e) => setCurrentUnit(e.target.value as TimeUnit || "seconds")}
                            disableUnderline
                            sx={{ mr: -1.5, "&:hover": { bgcolor: "transparent" }, "& .MuiSelect-select": { py: 0 }}}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  mt: 1.5,
                                  borderRadius: 1.5,
                                },
                              }
                            }}
                            >
                            <MenuItem value="seconds">seconds</MenuItem>
                            <MenuItem value="minutes">minutes</MenuItem>
                            <MenuItem value="hours">hours</MenuItem>
                            <MenuItem value="days">days</MenuItem>
                          </Select>
                        </Box>
                      )
                    }
                  }}
                  />
              </Box>
            )}
            {showWebhook && (
              <Box sx={{flex: 3}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5 }}
                    >
                    Webhook URL (optional)
                  </Typography>
                  <InfoTooltip
                    title={
                      <Typography variant="body2">
                        The human's response and any metadata will be sent to this webhook URL.
                      </Typography>
                    }
                    />
                </Box>
                <CreateTextField
                  placeholder="https://cloud.n8n.com/webhook/a0e934fe-5920-49f1-8821-1b7ffc312573"
                  fullWidth
                  size="small"
                  value={webhook || ""}
                  onChange={(e) => setWebhook(e.target.value || undefined)}
                  />
              </Box>
            )}
          </Stack>
          <Divider />
          {uiChannel !== "whatsapp" && (
            <Box>
              <Typography variant="body2" sx={{mb: 0.5}}>
                Outgoing messages template
              </Typography>
              <CreateTextField
                multiline 
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
            <Typography variant="body2" sx={{mb: 0.5}}>
              Response template
            </Typography>
            <CreateTextField 
              multiline
              maxRows={5}
              placeholder="Human response: {{message}}."
              value={responseTemplate ?? ""}
              onChange={(e) => 
                setResponseTemplate(e.target.value || undefined)
              }
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{mb: 0.5}}>
              No-response template
            </Typography>
            <CreateTextField 
              multiline
              maxRows={5}
              placeholder="Human did not respond. Consider where you left off."
              value={noResponseTemplate}
              onChange={(e) => 
                setNoResponseTemplate(e.target.value || undefined)
              }
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
}

export default AdvancedOptions;
