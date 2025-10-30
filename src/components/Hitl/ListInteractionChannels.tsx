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
} from "@mui/joy";
import { ContentCopy, DeleteOutline, Send } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import slack from "../../assets/slack-color.png";
import whatsapp from "../../assets/whatsapp.png";
import sms from "../../assets/sms.png";
import call from "../../assets/call.png";
import { Usage } from "../shared/Usage";
import { Medium } from "../../types/backend-frontend";

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
        <Usage />
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
                borderRadius: "16px",
                p: 2,
                width: 250,
                display: "flex",
                flexDirection: "column",
                boxShadow: "sm",
              }}
            >
              <Box
                component="img"
                src={iconSrc}
                sx={{ width: 32, height: 32, mb: 1 }}
              />
              <CardContent >
                <Typography level="body-sm">
                  Contact: {e.humanNumber}
                </Typography>
                {e.agentNumber && (
                  <Typography level="body-sm">
                    Agent number: {e.agentNumber}
                  </Typography>
                )}
                {e.waitTime && <Typography level="body-sm">
                  Wait time: {e.waitTime} seconds
                </Typography>}
                {e.webhook && (
                  <Typography level="body-sm" sx={{ overflow: "scroll" }}>
                    Webhook URL: {e.webhook}
                  </Typography>
                )}
                {e.validTime && (
                  <Typography level="body-sm">
                    Follow-up time: {formatDuration(e.validTime)}
                  </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography level="body-sm">Copy MCP URL</Typography>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => handleCopy(e.id)}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  size="sm"
                  variant="solid"
                  color="primary"
                  startDecorator={<Send />}
                  onClick={() => apiClient.sendTestMessage(e.id)}
                >
                  Send Test
                </Button>

                <IconButton
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={async () => {
                    await apiClient.deleteInteractionChannel(e.id);
                    await getIcs();
                  }}
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
});
