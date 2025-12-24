import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { RefreshRounded } from "@mui/icons-material";
import type { AxiosError } from "axios";

import withLoggedIn from "../../context/withLoggedIn";
import { apiClient } from "../../api-client";
import { InteractionCard, type InteractionCardData } from "./InteractionCard";

type ActiveInteraction = InteractionCardData & { waitTime: number };

interface ActiveInteractionsProps {
  focusedInteractionId?: string;
}

export function ActiveInteractions({
  focusedInteractionId,
}: ActiveInteractionsProps) {
  const [data, setData] = useState<ActiveInteraction[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const focusedRef = useRef<HTMLDivElement>(null);
  const hasScrolledToFocused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to focused interaction when data loads
  useEffect(() => {
    if (
      focusedInteractionId &&
      focusedRef.current &&
      !hasScrolledToFocused.current &&
      data.length > 0
    ) {
      hasScrolledToFocused.current = true;
      focusedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedInteractionId, data]);

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
    async (id: string, response: string) => {
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
        throw err; // Re-throw so InteractionCard knows submission failed
      } finally {
        setSubmittingId(null);
      }
    },
    [load],
  );

  const hasNoData = !loading && data.length === 0;

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
        </Sheet>
      ) : (
        <Stack spacing={2}>
          {data.map((item) => {
            const isFocused = item.id === focusedInteractionId;

            return (
              <InteractionCard
                key={item.id}
                ref={isFocused ? focusedRef : undefined}
                interaction={item}
                now={now}
                onSubmit={(response) => handleSubmit(item.id, response)}
                isFocused={isFocused}
                isSubmitting={submittingId === item.id}
                isDisabled={submittingId !== null && submittingId !== item.id}
                responseValue={responses[item.id] ?? ""}
                onResponseChange={(value) =>
                  setResponses((prev) => ({ ...prev, [item.id]: value }))
                }
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

// Default export wraps with auth check for use in Hitl dashboard tabs
// Named export (ActiveInteractions) is available for direct use (e.g., PublicReply)
function ActiveInteractionsWithAuth() {
  return <ActiveInteractions />;
}

export default withLoggedIn(ActiveInteractionsWithAuth);
