import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { RefreshRounded, SendRounded } from "@mui/icons-material";
import type { AxiosError } from "axios";

import withLoggedIn from "../../context/withLoggedIn";
import { apiClient } from "../../api-client";
import { displayDateTime } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";
import { Medium } from "../../types/backend-frontend";
import { CreateTextField } from "../shared/CreateTextField";
import CreateButton from "../shared/CreateButton";

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
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>Active Interactions</Typography>
        <Box sx={{ display: "flex", gap: 1, bgcolor: "paper", border: 1, borderRadius: 2, borderColor: "divider"}}>
          <IconButton
            size="small"
            sx={{color: "text.primary"}}
            onClick={() => void load({ showSpinner: true })}
            disabled={loading || refreshing}
          >
            {loading || refreshing ? (
              <CircularProgress size="sm" />
            ) : (
              <RefreshRounded/>
            )}
          </IconButton>
        </Box>
      </Stack>

      {error ? (
        <Alert severity="error" >
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, p: 6, textAlign: "center" }}
        >
          <CircularProgress />
        </Paper>
      ) : hasNoData ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, p: 4, textAlign: "center" }}
        >
          <Typography variant="body1">
            No active interactions right now.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((row) => {
            const createdAt = new Date(row.createdAt);
            const expiresAt = new Date(row.expiresAt);
            const statusColor =
              row.remainingSeconds > 60
                ? "success"
                : row.remainingSeconds > 0
                  ? "error"
                  : "info";
            const statusLabel =
              row.remainingSeconds > 0
                ? `${row.remainingSeconds}s left`
                : "Expired";
            const metadataEntries = Object.entries(row.metadata ?? {});

            return (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  borderRadius: 4,
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
                    <Typography variant="h6">{row.humanNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created {displayDateTime(createdAt)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    justifyContent={{ xs: "flex-start", md: "flex-end" }}
                  >
                    <Chip color="primary" size="small" label={mediumToUiChannelMap[row.medium as Medium]}/> 
                    <Chip variant="outlined" size="small" label={row.type} />
                    {row.agentNumber ? (
                      <Chip size="small" label={`Agent-${row.agentNumber}`} />
                    ) : null}
                    <Chip color={statusColor} size="small" label={statusLabel} />
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
                      <Typography variant="body2" color="text.secondary">
                        Message
                      </Typography>
                      <Typography
                        variant="body2"
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
                        <Typography variant="body2" color="text.secondary">
                          Metadata
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          rowGap={0.75}
                        >
                          {metadataEntries.map(([key, value]) => (
                            <Chip key={key} size="small" label={`${key}: ${String(value)}`} />
                          ))}
                        </Stack>
                      </Stack>
                    ) : null}

                    <Stack spacing={0.5}>
                      <LinearProgress
                        variant="determinate"
                        value={row.progress}
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          "& .MuiLinearProgress-bar": {
                            transition: "none",
                          },
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Expires {displayDateTime(expiresAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                    <Typography variant="body2" color="text.secondary">
                      Your response
                    </Typography>
                    <CreateTextField
                      multiline
                      minRows={3}
                      value={responses[row.id] ?? ""}
                      onChange={(event) =>
                        setResponses((prev) => ({
                          ...prev,
                          [row.id]: event.target.value,
                        }))
                      }
                      placeholder="Type your response..."
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Box>
                        <CreateButton
                          showLabels={false}
                          showColors={false}
                          size="small"
                          variant="contained"
                          startIcon={<SendRounded />}
                          onCreate={() => handleSubmit(row.id)}
                          loading={submittingId === row.id}
                          disabled={
                            (submittingId !== null && submittingId !== row.id) ||
                            row.remainingSeconds === 0
                          }
                          >
                          Send response
                        </CreateButton>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

export default withLoggedIn(ActiveInteractions);
