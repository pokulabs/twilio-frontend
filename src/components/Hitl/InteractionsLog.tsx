import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  Typography,
} from "@mui/material";
import { displayDateTime } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";
import withLoggedIn from "../../context/withLoggedIn";


type Interaction = NonNullable<
  Awaited<ReturnType<typeof apiClient.getInteractions>>["data"]
> extends { data: infer D } ? D extends Array<infer R> ? R : never : never;

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
    <Stack spacing={2} sx={{ mt: 2}}>
      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: "grey.50", fontSize: "small", overflow: "hidden"}}>
        <Table 
          sx={{
            tableLayout: "fixed", 
            width: "100%", 
            "& th": {
              textAlign: "left", 
              p: 1, 
              fontWeight: 600,
              borderBottom: "2px solid",
              borderColor: "grey.300",
               whiteSpace: "nowrap",
               overflow: "hidden",
               textOverflow: "ellipsis"
            }, 
            "& td": { p: 1 },
          }}
        >
          <thead>
            <tr>
              <th title="Created">Created</th>
              <th title="Medium">Medium</th>
              <th title="Type">Type</th>
              <th title="Agent">Agent</th>
              <th title="Human">Human</th>
              <th title="Message">Message</th>
              <th title="Response">Response</th>
              <th title="Response Time">Response Time</th>
              <th title="Wait (s)">Wait (s)</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                </td>
              </tr>
            ) : data.length ? (
              data.map((r) => (
                <>
                  <tr key={r.id}>
                    <td>{displayDateTime(new Date(r.createdAt))}</td>
                    <td>{mediumToUiChannelMap[r.medium]}</td>
                    <td>{r.type}</td>
                    <td>{r.agentNumber}</td>
                    <td>{r.humanNumber}</td>
                    <td title={r.message} style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.message}
                    </td>
                    <td title={r.response ?? ""} style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.response ?? ""}
                    </td>
                    <td>
                      {r.responseTime ? displayDateTime(new Date(r.responseTime)) : ""}
                    </td>
                    <td>{r.waitTime}</td>
                  </tr>
                  <tr key={`${r.id}-divider`}>
                    <td colSpan={9} style={{ padding: 0, height: 0 }}>
                      <Divider />
                    </td>
                  </tr>
                </>
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
      </Paper>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          sx={{textTransform: "none", fontWeight: 700}}
          disabled={loading || page <= 1}
          onClick={() => void load(page - 1)}
        >
          Prev
        </Button>
        <Typography variant="body2">
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          sx={{textTransform: "none", fontWeight: 700}}
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
