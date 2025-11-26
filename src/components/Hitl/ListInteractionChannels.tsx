import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from "@mui/joy";
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

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = totalSeconds / 60;
  if (minutes < 60)
    return `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)}m`;
  const hours = minutes / 60;
  if (hours < 24)
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)}d`;
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
        <Typography level="body-lg" color="neutral">
          No interaction channels found.
        </Typography>
        <Typography level="body-md" color="neutral" sx={{ mt: 1 }}>
          Please configure a new interaction channel to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography level="title-md" sx={{ mt: 2 }}>
        My Channels
      </Typography>
      <Box sx={{ mb: 2, mt: 1 }}>
        <CreditsRemaining />
      </Box>
      <Stack direction="row" gap={3} sx={{ flexWrap: "wrap" }}>
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
                borderRadius: "lg",
                p: 2,
                width: 300,
                display: "flex",
                flexDirection: "column",
                boxShadow: "sm",
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "md",
                },
              }}
            >
              {/* Header */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img"
                  src={iconSrc}
                  sx={{ width: 40, height: 40, borderRadius: "sm" }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography level="title-md" noWrap>
                    {e.humanNumber}
                  </Typography>
                  <Typography level="body-xs" color="neutral">
                    {getMediumLabel(e.medium)}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <CardContent sx={{ flex: 1, gap: 1.5 }}>
                {/* Details Grid */}
                <Stack spacing={1}>
                  {e.agentNumber && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SupportAgent fontSize="small" titleAccess="Agent" />
                      <Typography level="body-sm">{e.agentNumber}</Typography>
                    </Stack>
                  )}

                  {e.waitTime && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Timer fontSize="small" titleAccess="Wait Time" />
                        <Typography level="body-sm">
                          {e.waitTime} seconds
                        </Typography>
                    </Stack>
                  )}

                  {e.validTime && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AccessTime fontSize="small" titleAccess="Follow-up" />
                      <Typography level="body-sm">
                        {formatDuration(e.validTime)}
                      </Typography>
                    </Stack>
                  )}

                  {e.linkEnabled && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LinkIcon fontSize="small" titleAccess="Reply Link" />
                      <Chip
                        size="sm"
                        variant="soft"
                        color="success"
                      >
                        Reply Link Active
                      </Chip>
                    </Stack>
                  )}

                  {e.webhook && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Http fontSize="small" titleAccess="Webhook" />
                      <Typography level="body-sm" title={e.webhook} noWrap>
                        {e.webhook}
                      </Typography>
                    </Stack>
                  )}

                  {(e.messageTemplate ||
                    e.responseTemplate ||
                    e.noResponseTemplate) && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Description fontSize="small" titleAccess="Custom Templates" />
                      <Chip
                        size="sm"
                        variant="soft"
                        color="success"
                      >
                        Custom Templates Active
                      </Chip>
                    </Stack>
                  )}
                </Stack>
              </CardContent>

              {/* MCP URL Section */}
              <Box
                sx={{
                  mt: 2,
                  p: 1,
                  bgcolor: "background.level1",
                  borderRadius: "sm",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography level="body-xs" fontWeight="bold">
                    MCP URL
                  </Typography>
                  <Typography level="body-xs" noWrap color="neutral">
                    {`https://mcp.pokulabs.com/${e.id}`}
                  </Typography>
                </Box>
                <Tooltip title="Copy URL" variant="solid">
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => handleCopy(e.id)}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Actions */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  size="sm"
                  variant="outlined"
                  color="primary"
                  startDecorator={<Send />}
                  onClick={() => apiClient.sendTestMessage(e.id)}
                >
                  Send Test
                </Button>

                <Tooltip title="Delete Channel" color="danger" variant="solid">
                  <IconButton
                    size="sm"
                    variant="outlined"
                    color="danger"
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
