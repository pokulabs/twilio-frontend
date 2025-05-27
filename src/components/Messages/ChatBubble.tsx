import Box from "@mui/joy/Box";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import type { PlainMessage } from "../../types";
import { displayDateTime } from "../../utils";

type ChatBubbleProps = PlainMessage;

export default function ChatBubble(props: ChatBubbleProps) {
  const { content, timestamp, direction, status } = props;
  const isSent = direction === "sent";
  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.25 }}
      >
        <Typography level="body-xs">
          {displayDateTime(new Date(timestamp))}
        </Typography>
      </Stack>
      <Box sx={{ position: "relative" }}>
        <Sheet
          color={isSent ? "primary" : "neutral"}
          variant={isSent ? "solid" : "soft"}
          sx={[
            {
              p: 1.25,
              borderRadius: "lg",
            },
            isSent
              ? {
                  borderTopRightRadius: 0,
                }
              : {
                  borderTopRightRadius: "lg",
                },
            isSent
              ? {
                  borderTopLeftRadius: "lg",
                }
              : {
                  borderTopLeftRadius: 0,
                },
            isSent
              ? {
                  backgroundColor: "var(--joy-palette-primary-solidBg)",
                }
              : {
                  backgroundColor: "background.body",
                },
          ]}
        >
          <Typography
            level="body-sm"
            sx={[
              isSent
                ? {
                    color: "var(--joy-palette-common-white)",
                  }
                : {
                    color: "var(--joy-palette-text-primary)",
                  },
              !["delivered", "received", "read"].includes(status)
                ? {
                    color: "var(--joy-palette-danger-400)",
                  }
                : {},
              {
                overflowWrap: "anywhere",
              },
            ]}
          >
            {content}
          </Typography>
        </Sheet>
      </Box>
    </Box>
  );
}
