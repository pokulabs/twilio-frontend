import Box from "@mui/joy/Box";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import type { PlainMessage } from "../../types";
import { displayDynamicDateTime } from "../../utils";
import React from "react";
import { Link } from "@mui/joy";

export default function ChatBubble(props: PlainMessage) {
  const isSent = props.direction === "outbound";
  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.25 }}
      >
        <Typography level="body-xs">
          {displayDynamicDateTime(new Date(props.timestamp))}
        </Typography>
        {!!props.errorCode && (
          <Typography level="body-xs">
            Error code:{" "}
            <Link
              href={`https://www.twilio.com/docs/api/errors/${props.errorCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.errorCode}
            </Link>
          </Typography>
        )}
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
            {
              borderTopRightRadius: isSent ? 0 : "lg",
            },
            {
              borderTopLeftRadius: isSent ? "lg" : 0,
            },
            {
              backgroundColor: isSent
                ? "var(--joy-palette-primary-solidBg)"
                : "background.body",
            },
          ]}
        >
          <Typography
            level="body-sm"
            sx={[
              {
                color: isSent
                  ? "var(--joy-palette-common-white)"
                  : "var(--joy-palette-text-primary)",
              },
              !["delivered", "received", "read"].includes(props.status)
                ? {
                    color: "var(--joy-palette-danger-400)",
                  }
                : {},
              {
                overflowWrap: "anywhere",
              },
            ]}
          >
            {props.content.split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </Sheet>
      </Box>
    </Box>
  );
}
