import { Fragment, useEffect, useState } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Sheet,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { displayDateTime, formatDurationHumanReadable } from "../../utils";
import { mediumToUiChannelMap } from "./HumanAsATool";

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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
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
      setExpandedRows({});
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

  const toggleRow = (interactionId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [interactionId]: !prev[interactionId],
    }));
  };

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {/* Summary Statistics */}
      {stats && stats.totalTitForTat > 0 && (
        <Stack direction="row" spacing={2}>
          <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
              Avg Response Time
            </Typography>
            <Typography level="h4">
              {stats.avgResponseTimeSeconds !== null
                ? formatDurationHumanReadable(stats.avgResponseTimeSeconds)
                : "—"}
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
              No Response Rate
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
              <th style={{ width: 56 }} />
              <th>Medium</th>
              <th>From</th>
              <th>To</th>
              <th>Last Activity</th>
              <th>Latest Message</th>
              <th>Wait</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                </td>
              </tr>
            ) : data.length ? (
              data.map((interaction) => {
                const isExpanded = Boolean(expandedRows[interaction.interactionId]);
                const latestMessage = interaction.messages.at(-1);
                const latestMessageText =
                  latestMessage?.message.body?.trim() || "(No message body)";
                const latestActivityAt = latestMessage?.createdAt ?? interaction.createdAt;
                const mediumLabel = interaction.medium
                  ? mediumToUiChannelMap[interaction.medium] ?? interaction.medium
                  : "Unknown";

                return (
                  <Fragment key={interaction.interactionId}>
                    <tr>
                      <td>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => toggleRow(interaction.interactionId)}
                        >
                          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {mediumLabel}
                        </Chip>
                      </td>
                      <td>{interaction.agentNumber ?? "N/A"}</td>
                      <td>{interaction.humanNumber ?? "N/A"}</td>
                      <td>{displayDateTime(new Date(latestActivityAt))}</td>
                      <td
                        title={latestMessageText}
                        style={{
                          maxWidth: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {latestMessageText}
                      </td>
                      <td>
                        {interaction.waitTime != null
                          ? formatDurationHumanReadable(interaction.waitTime)
                          : "—"}
                      </td>
                      <td>
                        {interaction.validTime != null
                          ? formatDurationHumanReadable(interaction.validTime)
                          : "—"}
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr>
                        <td colSpan={8}>
                          <Box sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                              {interaction.messages.map((message, index) => (
                                <Box key={message.id}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 1,
                                      mb: 0.5,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Chip
                                      size="sm"
                                      color={message.from === "human" ? "success" : "neutral"}
                                      variant={message.from === "human" ? "solid" : "soft"}
                                    >
                                      {message.from === "human" ? "Received from user" : "Sent to user"}
                                    </Chip>
                                    <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                                      {displayDateTime(new Date(message.createdAt))}
                                    </Typography>
                                  </Box>
                                  <Typography level="body-sm">
                                    {message.message.body?.trim() || "(No message body)"}
                                  </Typography>
                                  {message.message.image_links?.length ? (
                                    <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                                      <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                                        Attachments
                                      </Typography>
                                      {message.message.image_links.map((url) => (
                                        <Link key={url} href={url} target="_blank" rel="noreferrer">
                                          {url}
                                        </Link>
                                      ))}
                                    </Stack>
                                  ) : null}
                                  {index < interaction.messages.length - 1 ? (
                                    <Divider sx={{ mt: 1.25 }} />
                                  ) : null}
                                </Box>
                              ))}

                              {interaction.medium === "call_poku" ? (
                                <Stack spacing={1}>
                                  <Divider />
                                  <Typography level="title-sm">Call details</Typography>
                                  {interaction.call?.recordingUrl ? (
                                    <audio controls src={interaction.call.recordingUrl}>
                                      Your browser does not support audio playback.
                                    </audio>
                                  ) : (
                                    <Typography level="body-sm" sx={{ color: "neutral.500" }}>
                                      No recording URL available.
                                    </Typography>
                                  )}
                                  <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
                                    {interaction.call?.transcript?.trim() || "No transcript available."}
                                  </Typography>
                                </Stack>
                              ) : null}
                            </Stack>
                          </Box>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>
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

export default InteractionsLog;
