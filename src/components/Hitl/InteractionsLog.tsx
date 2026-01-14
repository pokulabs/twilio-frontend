import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Sheet,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { displayDateTime, formatDurationHumanReadable } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";
import withLoggedIn from "../../context/withLoggedIn";

type Interaction =
  NonNullable<
    Awaited<ReturnType<typeof apiClient.getInteractions>>["data"]
  > extends { data: infer D }
    ? D extends Array<infer R>
      ? R
      : never
    : never;

type Stats = NonNullable<
  Awaited<ReturnType<typeof apiClient.getInteractionStats>>["data"]
>;

function InteractionsLog() {
  const [data, setData] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiClient.getInteractions({ page: p, pageSize });
      if (!res.data) return;
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setPage(res.data.pagination.page);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const res = await apiClient.getInteractionStats();
    if (res.data) {
      setStats(res.data);
    }
  };

  useEffect(() => {
    void load(1);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {/* Summary Statistics */}
      {stats && stats.totalTitForTat > 0 && (
        <Stack direction="row" spacing={2}>
          <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
              Avg Response Time (Reply Mode)
            </Typography>
            <Typography level="h4">
              {stats.avgResponseTimeSeconds !== null
                ? formatDurationHumanReadable(stats.avgResponseTimeSeconds)
                : "—"}
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
              No Response Rate (Reply Mode)
            </Typography>
            <Typography level="h4">
              {stats.noResponsePercent}%
            </Typography>
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              {stats.withoutResponse} of {stats.totalTitForTat} interactions
            </Typography>
          </Card>
        </Stack>
      )}

      <Sheet variant="outlined" sx={{ borderRadius: 8 }}>
        <Table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Medium</th>
              <th>Mode</th>
              <th>From</th>
              <th>Message</th>
              <th>Wait</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                </td>
              </tr>
            ) : data.length ? (
              data.map((r) => (
                <tr key={r.id}>
                  <td>{displayDateTime(new Date(r.createdAt))}</td>
                  <td>{mediumToUiChannelMap[r.medium]}</td>
                  <td>
                    {r.async && <Box component="span" sx={{ mr: 1, color: "info.main" }}>Async</Box>}
                    {r.titForTat && <Box component="span" sx={{ color: "info.main" }}>Reply</Box>}
                  </td>
                  <td>
                    {r.from}
                  </td>
                  <td
                    title={r.message}
                    style={{
                      maxWidth: 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.message}
                  </td>
                  <td>{r.waitTime != null ? formatDurationHumanReadable(r.waitTime) : "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <Box sx={{ p: 2 }}>No interactions yet.</Box>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          disabled={loading || page <= 1}
          onClick={() => void load(page - 1)}
        >
          Prev
        </Button>
        <Typography level="body-sm">
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          disabled={loading || page >= totalPages}
          onClick={() => void load(page + 1)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}

export default withLoggedIn(InteractionsLog);
