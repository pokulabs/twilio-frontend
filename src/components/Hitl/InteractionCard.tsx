import { forwardRef, useState } from "react";
import {
  Button,
  Chip,
  Divider,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { SendRounded } from "@mui/icons-material";

import { displayDateTime, formatDurationHumanReadable } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";
import type { InteractionHistoryItem } from "../../api-client";
import type { Medium } from "../../types/backend-frontend";

export interface InteractionCardData {
  id: string;
  createdAt: string;
  expiresAt: string | null;
  titForTat: boolean;
  humanNumber: string | null;
  agentNumber: string | null;
  medium: Medium | null;
  messages: InteractionHistoryItem["messages"];
  metadata: Record<string, unknown> | null;
}

interface InteractionCardProps {
  interaction: InteractionCardData;
  /** Current timestamp for calculating time remaining */
  now: number;
  /** Called when user submits a response */
  onSubmit: (response: string) => Promise<void>;
  /** Whether this card is the focused/highlighted one */
  isFocused?: boolean;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Whether submission is disabled (e.g., another card is submitting) */
  isDisabled?: boolean;
  /** Initial response value (for controlled state from parent) */
  responseValue?: string;
  /** Called when response text changes (for controlled state from parent) */
  onResponseChange?: (value: string) => void;
}

export const InteractionCard = forwardRef<HTMLDivElement, InteractionCardProps>(
  function InteractionCard(
    {
      interaction,
      now,
      onSubmit,
      isFocused = false,
      isSubmitting = false,
      isDisabled = false,
      responseValue,
      onResponseChange,
    },
    ref,
  ) {
    // Use internal state if not controlled
    const [internalResponse, setInternalResponse] = useState("");
    const response = responseValue ?? internalResponse;
    const setResponse = onResponseChange ?? setInternalResponse;

    const [localSubmitting, setLocalSubmitting] = useState(false);
    const submitting = isSubmitting || localSubmitting;

    const expiresAtMs = interaction.expiresAt
      ? new Date(interaction.expiresAt).getTime()
      : null;
    const remainingSeconds =
      expiresAtMs === null ? null : Math.max(0, Math.floor((expiresAtMs - now) / 1000));
    const createdAt = new Date(interaction.createdAt);
    const statusColor =
      remainingSeconds === null
        ? "neutral"
        : remainingSeconds > 60
        ? "success"
        : remainingSeconds > 0
          ? "warning"
          : "neutral";
    const statusLabel =
      remainingSeconds === null
        ? "No expiry"
        : remainingSeconds > 0
        ? `${formatDurationHumanReadable(remainingSeconds)} left`
        : "Expired";
    const metadataEntries = Object.entries(interaction.metadata ?? {});
    const isExpired = remainingSeconds !== null && remainingSeconds === 0;
    const latestMessage = interaction.messages.at(-1);
    const latestMessageText =
      latestMessage?.message.body?.trim() || "(No message body)";
    const mediumLabel = interaction.medium
      ? mediumToUiChannelMap[interaction.medium] ?? interaction.medium
      : "Unknown";

    const handleSubmit = async () => {
      if (!response.trim() || isExpired) return;
      setLocalSubmitting(true);
      try {
        await onSubmit(response.trim());
        setResponse("");
      } finally {
        setLocalSubmitting(false);
      }
    };

    return (
      <Sheet
        ref={ref}
        variant="outlined"
        sx={{
          borderRadius: 12,
          p: { xs: 2, sm: 3 },
          gap: 2,
          display: "flex",
          flexDirection: "column",
          ...(isFocused && {
            borderColor: "primary.500",
            borderWidth: 2,
            boxShadow: "sm",
          }),
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          flexWrap="wrap"
          rowGap={1.5}
        >
          <Stack spacing={0.5}>
            <Typography level="title-md">{interaction.humanNumber ?? "Unknown contact"}</Typography>
            <Typography level="body-sm" color="neutral">
              Created {displayDateTime(createdAt)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            <Chip color="primary" variant="soft" size="sm">
              {mediumLabel}
            </Chip>
            {interaction.titForTat && (
              <Chip variant="outlined" size="sm" color="warning">
                Tit-for-Tat
              </Chip>
            )}
            {interaction.agentNumber ? (
              <Chip variant="soft" size="sm">
                Agent {interaction.agentNumber}
              </Chip>
            ) : null}
            <Chip color={statusColor} size="sm" variant="solid">
              {statusLabel}
            </Chip>
          </Stack>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2.5}
          alignItems="stretch"
        >
          <Stack spacing={1.5} flex={1} minWidth={0}>
            <Stack spacing={0.5}>
              <Typography level="body-sm" color="neutral">
                Message
              </Typography>
              <Typography
                level="body-md"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {latestMessageText}
              </Typography>
            </Stack>

            {metadataEntries.length ? (
              <Stack spacing={0.75}>
                <Typography level="body-sm" color="neutral">
                  Metadata
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  rowGap={0.75}
                >
                  {metadataEntries.map(([key, value]) => (
                    <Chip key={key} size="sm" variant="soft">
                      {key}: {String(value)}
                    </Chip>
                  ))}
                </Stack>
              </Stack>
            ) : null}
          </Stack>

          <Stack
            spacing={1}
            flex={{ xs: 1, lg: 0.9 }}
            minWidth={{ xs: "100%", lg: 280 }}
          >
            <Textarea
              minRows={3}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              placeholder="Type your response..."
              disabled={isExpired}
              sx={{
                "& textarea": {
                  fontSize: "0.95rem",
                },
              }}
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="sm"
                startDecorator={<SendRounded />}
                onClick={() => void handleSubmit()}
                loading={submitting}
                disabled={isDisabled || isExpired || !response.trim()}
              >
                Send response
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Sheet>
    );
  },
);

