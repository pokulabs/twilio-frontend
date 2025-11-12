import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import { RefreshRounded, SendRounded } from "@mui/icons-material";
import type { AxiosError } from "axios";

import withLoggedIn from "../../context/withLoggedIn";
import { apiClient } from "../../api-client";
import { displayDateTime } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";

type ActiveInteraction =
  NonNullable<
    Awaited<ReturnType<typeof apiClient.getActiveInteractions>>["data"]
  > extends { data: infer D }
    ? D extends Array<infer R>
      ? R
      : never
    : never;

function ActiveInteractions() {
  const [data, setData] = useState<ActiveInteraction[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(
    async ({ showSpinner = false }: { showSpinner?: boolean } = {}) => {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const res = await apiClient.getActiveInteractions();
        const items = res.data?.data ?? [];
        setData(items);
        setResponses((prev) => {
          const next: Record<string, string> = {};
          for (const item of items) {
            next[item.id] = prev[item.id] ?? "";
          }
          return next;
        });
      } catch (err) {
        const errorMessage =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          (err instanceof Error
            ? err.message
            : "Failed to load active interactions");
        setError(errorMessage);
      } finally {
        if (showSpinner) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void load({ showSpinner: true });
    const interval = setInterval(() => {
      void load();
    }, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSubmit = useCallback(
    async (id: string) => {
      const response = responses[id]?.trim();
      if (!response) {
        setError("Response cannot be empty");
        return;
      }

      setSubmittingId(id);
      setError(null);
      try {
        await apiClient.respondToInteraction(id, response);
        setResponses((prev) => ({ ...prev, [id]: "" }));
        await load();
      } catch (err) {
        const errorMessage =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          (err instanceof Error ? err.message : "Failed to submit response");
        setError(errorMessage);
      } finally {
        setSubmittingId(null);
      }
    },
    [responses, load],
  );

  const rows = useMemo(() => {
    return data.map((item) => {
      const createdAtMs = new Date(item.createdAt).getTime();
      const expiresAtMs = new Date(item.expiresAt).getTime();
      const totalSeconds = Math.max(
        1,
        Math.floor((expiresAtMs - createdAtMs) / 1000),
      );
      const remainingSeconds = Math.max(
        0,
        Math.floor((expiresAtMs - now) / 1000),
      );
      const elapsedSeconds = Math.min(
        totalSeconds,
        totalSeconds - remainingSeconds,
      );
      const progress = Math.round((elapsedSeconds / totalSeconds) * 100);

      return {
        ...item,
        remainingSeconds,
        totalSeconds,
        progress,
      };
    });
  }, [data, now]);

  const hasNoData = !loading && rows.length === 0;

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="title-lg">Active Interactions</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            variant="outlined"
            color="neutral"
            size="sm"
            onClick={() => void load({ showSpinner: true })}
            disabled={loading || refreshing}
          >
            {loading || refreshing ? (
              <CircularProgress size="sm" variant="plain" />
            ) : (
              <RefreshRounded />
            )}
          </IconButton>
        </Box>
      </Stack>

      {error ? (
        <Alert color="danger" variant="soft">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Sheet
          variant="outlined"
          sx={{ borderRadius: 8, p: 6, textAlign: "center" }}
        >
          <CircularProgress />
        </Sheet>
      ) : hasNoData ? (
        <Sheet
          variant="outlined"
          sx={{ borderRadius: 8, p: 4, textAlign: "center" }}
        >
          <Typography level="body-md">
            No active interactions right now.
          </Typography>
          <Typography level="body-sm" color="neutral">
            We refresh automatically every 15 seconds.
          </Typography>
        </Sheet>
      ) : (
        <Stack spacing={2}>
          {rows.map((row) => {
            const createdAt = new Date(row.createdAt);
            const expiresAt = new Date(row.expiresAt);
            const statusColor =
              row.remainingSeconds > 60
                ? "success"
                : row.remainingSeconds > 0
                  ? "warning"
                  : "neutral";
            const statusLabel =
              row.remainingSeconds > 0
                ? `${row.remainingSeconds}s left`
                : "Expired";
            const metadataEntries = Object.entries(row.metadata ?? {});

            return (
              <Sheet
                key={row.id}
                variant="outlined"
                sx={{
                  borderRadius: 12,
                  p: { xs: 2, sm: 3 },
                  gap: 2,
                  display: "flex",
                  flexDirection: "column",
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
                    <Typography level="title-md">{row.humanNumber}</Typography>
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
                      {mediumToUiChannelMap[row.medium]}
                    </Chip>
                    <Chip variant="outlined" size="sm">
                      {row.type}
                    </Chip>
                    {row.agentNumber ? (
                      <Chip variant="soft" size="sm">
                        Agent {row.agentNumber}
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
                        {row.message}
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

                    <Stack spacing={0.5}>
                      <LinearProgress
                        determinate
                        value={row.progress}
                        sx={{
                          bgcolor: "background.level2",
                          "& .MuiLinearProgress-bar": {
                            transition: "none",
                          },
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography level="body-xs" color="neutral">
                          Expires {displayDateTime(expiresAt)}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {row.totalSeconds - row.remainingSeconds}s elapsed
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack
                    spacing={1}
                    flex={{ xs: 1, lg: 0.9 }}
                    minWidth={{ xs: "100%", lg: 280 }}
                  >
                    <Typography level="body-sm" color="neutral">
                      Your response
                    </Typography>
                    <Textarea
                      minRows={3}
                      value={responses[row.id] ?? ""}
                      onChange={(event) =>
                        setResponses((prev) => ({
                          ...prev,
                          [row.id]: event.target.value,
                        }))
                      }
                      placeholder="Type your response..."
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
                        onClick={() => void handleSubmit(row.id)}
                        loading={submittingId === row.id}
                        disabled={
                          (submittingId !== null && submittingId !== row.id) ||
                          row.remainingSeconds === 0
                        }
                      >
                        Send response
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Sheet>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

export default withLoggedIn(ActiveInteractions);
