import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import {
  Box,
  Button,
  CircularProgress,
  Sheet,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { displayDateTime } from "../../utils";
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

function InteractionsLog() {
  const [data, setData] = useState<Interaction[]>([]);
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

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Sheet variant="outlined" sx={{ borderRadius: 8 }}>
        <Table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Medium</th>
              <th>Type</th>
              <th>Agent</th>
              <th>Human</th>
              <th>Message</th>
              <th>Response</th>
              <th>Response Time</th>
              <th>Wait (s)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
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
                  <td>{r.type}</td>
                  <td>{r.agentNumber}</td>
                  <td>{r.humanNumber}</td>
                  <td
                    title={r.message}
                    style={{
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.message}
                  </td>
                  <td
                    title={r.response ?? ""}
                    style={{
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.response ?? ""}
                  </td>
                  <td>
                    {r.responseTime
                      ? displayDateTime(new Date(r.responseTime))
                      : ""}
                  </td>
                  <td>{r.waitTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
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
