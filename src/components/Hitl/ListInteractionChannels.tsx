import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Box,
  Chip,
  Tooltip
} from "@mui/material";
import {
  ContentCopy,
  DeleteOutline,
  Send,
  SupportAgent,
  AccessTime,
  Timer,
  Link as LinkIcon,
  Description,
  Http,
} from "@mui/icons-material";
import { apiClient } from "../../api-client";
import slack from "../../assets/slack-color.png";
import whatsapp from "../../assets/whatsapp.png";
import sms from "../../assets/sms.png";
import call from "../../assets/call.png";
import { CreditsRemaining } from "../shared/Usage";
import { Medium } from "../../types/backend-frontend";
import CreateButton from "../shared/CreateButton";

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  if (totalSeconds < 60) return `${totalSeconds} seconds`;
  const minutes = totalSeconds / 60;
  if (minutes < 60)
    return `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)} minutes`;
  const hours = minutes / 60;
  if (hours < 24)
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours`;
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)} days`;
}

function getMediumLabel(medium: Medium): string {
  switch (medium) {
    case "slack":
    case "slack_poku":
      return "Slack";
    case "whatsapp_poku":
      return "WhatsApp";
    case "call_poku":
      return "Voice Call";
    case "sms":
    case "sms_poku":
      return "SMS";
    default:
      return medium;
  }
}

export const ListInteractionChannels = forwardRef((_props, ref) => {
  const [ics, setIcs] = useState<
    NonNullable<
      Awaited<ReturnType<typeof apiClient.getInteractionChannels>>["data"]
    >["data"]
  >([]);

  const getIcs = async () => {
    const interactionChannels = await apiClient.getInteractionChannels();
    if (interactionChannels.data) {
      setIcs(interactionChannels.data.data);
    }
  };

  useEffect(() => {
    void getIcs();
  }, []);

  useImperativeHandle(ref, () => ({
    reload: getIcs,
  }));

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`https://mcp.pokulabs.com/${id}`);
  };

  if (ics.length === 0) {
    return (
      <Box sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <Typography variant="body1" color="neutral">
          No interaction channels found.
        </Typography>
        <Typography variant="body2" color="neutral" sx={{ mt: 1 }}>
          Please configure a new interaction channel to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        My Channels
      </Typography>
      <Box sx={{ mb: 2, mt: 1 }}>
        <CreditsRemaining />
      </Box>
      <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
        {ics.map((e) => {
          const mediumIconMap: Record<Medium, string> = {
            slack: slack,
            slack_poku: slack,
            whatsapp_poku: whatsapp,
            call_poku: call,
            sms: sms,
            sms_poku: sms,
          };
          const iconSrc = mediumIconMap[e.medium];

          return (
            <Card
              key={e.id}
              variant="outlined"
              sx={{
                color: "text.secondary",
                borderRadius: "16px",
                p: 2,
                width: 300,
                display: "flex",
                flexDirection: "column",
                boxShadow: 1,
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img"
                  src={iconSrc}
                  sx={{ width: 40, height: 40, borderRadius: 1 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {e.humanNumber}
                  </Typography>
                  <Typography variant="caption" color="neutral">
                    {getMediumLabel(e.medium)}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <CardContent sx={{ flex: 1, pl: 0}}>
                {/* Details Grid */}
                <Stack spacing={1}>
                  {e.agentNumber && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SupportAgent sx={{fontSize: "16px"}} titleAccess="Agent" />
                      <Typography variant="body2">{e.agentNumber}</Typography>
                    </Stack>
                  )}

                  {e.waitTime && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Timer sx={{fontSize: "16px"}} titleAccess="Wait Time" />
                        <Typography variant="body2">
                          {e.waitTime} seconds
                        </Typography>
                    </Stack>
                  )}

                  {e.validTime && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AccessTime sx={{fontSize: "16px"}} titleAccess="Follow-up" />
                      <Typography variant="body2">
                        {formatDuration(e.validTime)}
                      </Typography>
                    </Stack>
                  )}

                  {e.linkEnabled && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LinkIcon sx={{fontSize: "16px"}} titleAccess="Reply Link" />
                      <Chip
                        sx={{fontSize: 12, bgcolor: "#e2ffedff", color: "#2a583bff"}}
                        size="small"
                        label="Reply Link Active"
                      />

                    </Stack>
                  )}

                  {e.webhook && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Http sx={{fontSize: "16px"}} titleAccess="Webhook" />
                      <Typography variant="body2" title={e.webhook} noWrap>
                        {e.webhook}
                      </Typography>
                    </Stack>
                  )}

                  {(e.messageTemplate ||
                    e.responseTemplate ||
                    e.noResponseTemplate) && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Description sx={{fontSize: "16px"}} titleAccess="Custom Templates" />
                      <Chip
                        sx={{fontSize: 12, bgcolor: "#e2ffedff", color: "#2a583bff"}}
                        size="small"
                        color="success"
                        label="Custom Templates Active"
                      />
                    </Stack>
                  )}
                </Stack>
              </CardContent>

              {/* MCP URL Section */}
              <Box
                sx={{
                  mt: 2,
                  p: 1,
                  bgcolor: "grey.100",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="caption" fontWeight="bold">
                    MCP URL
                  </Typography>
                  <Typography variant="caption" noWrap >
                    {`https://mcp.pokulabs.com/${e.id}`}
                  </Typography>
                </Box>
                <Tooltip 
                  title="Copy URL"
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: 14
                      }
                    }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(e.id)}
                  >
                    <ContentCopy sx={{fontSize: "20px"}} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Actions */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <CreateButton
                  showColors={false}
                  showLabels={false}
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<Send />}
                  onCreate={() => apiClient.sendTestMessage(e.id)}
                >
                  Send Test
                </CreateButton>


                <Tooltip 
                  title="Delete Channel"
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "red",
                        fontSize: 14
                      }
                    }
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    sx={{border: 1, borderRadius: 2, p: 0.5}}
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this channel?"
                        )
                      ) {
                        await apiClient.deleteInteractionChannel(e.id);
                        await getIcs();
                      }
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
});
