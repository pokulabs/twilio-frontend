import {
    Fragment,
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
} from "react";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Divider,
    IconButton,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { apiClient, type PhoneHistoryItem } from "../api-client";
import { appTheme } from "../theme";

const DEFAULT_PAGE_SIZE = 10;

export default function History() {
    const [interactions, setInteractions] = useState<PhoneHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalRows, setTotalRows] = useState(0);

    const loadHistory = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            setIsLoading(true);
            setErrorText(null);
            try {
                const res = await apiClient.listPhoneHistory({
                    page: nextPage + 1,
                    pageSize: nextPageSize,
                });
                setInteractions(res.data.data ?? []);
                setTotalRows(res.data.pagination.total ?? 0);
                setExpandedRows({});
            } catch {
                setErrorText("Failed to load phone history.");
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        void loadHistory(page, pageSize);
    }, [loadHistory, page, pageSize]);

    const toggleRow = (interactionId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [interactionId]: !prev[interactionId],
        }));
    };

    const handlePageChange = (_event: unknown, nextPage: number) => {
        setPage(nextPage);
    };

    const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPageSize(Number(event.target.value));
        setPage(0);
    };

    return (
        <ThemeProvider theme={appTheme}>
        <Box
            sx={{
                width: "100%",
                margin: "0 auto",
            }}
        >
            <Stack spacing={2.5}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => void loadHistory(page, pageSize)}
                        disabled={isLoading}
                    >
                        {isLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                </Box>

                {errorText ? <Alert severity="error">{errorText}</Alert> : null}

                {interactions.length === 0 && !isLoading ? (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography color="text.secondary">
                                No interactions found yet.
                            </Typography>
                        </CardContent>
                    </Card>
                ) : null}

                {interactions.length ? (
                    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: 56 }} />
                                    <TableCell>Medium</TableCell>
                                    <TableCell>From</TableCell>
                                    <TableCell>To</TableCell>
                                    <TableCell>Last Activity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {interactions.map((interaction) => {
                                    const isExpanded = Boolean(
                                        expandedRows[interaction.interactionId],
                                    );
                                    const latestMessage =
                                        interaction.messages[
                                            interaction.messages.length - 1
                                        ];
                                    const latestActivityAt =
                                        latestMessage?.createdAt ?? null;
                                    return (
                                        <Fragment key={interaction.interactionId}>
                                            <TableRow hover>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        aria-label={
                                                            isExpanded
                                                                ? "Collapse interaction"
                                                                : "Expand interaction"
                                                        }
                                                        onClick={() =>
                                                            toggleRow(interaction.interactionId)
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <KeyboardArrowUpRounded />
                                                        ) : (
                                                            <KeyboardArrowDownRounded />
                                                        )}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            interaction.medium === "call_poku"
                                                                ? "Call"
                                                                : "SMS"
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {interaction.agentNumber ?? "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {interaction.humanNumber ?? "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {latestActivityAt
                                                        ? new Date(
                                                              latestActivityAt,
                                                          ).toLocaleString()
                                                        : "N/A"}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ py: 0 }}>
                                                    <Collapse
                                                        in={isExpanded}
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Box sx={{ p: 2 }}>
                                                            <Stack spacing={1.5}>
                                                                {interaction.messages.map(
                                                                    (message) => (
                                                                        <Box key={message.id}>
                                                                            <Box
                                                                                sx={{
                                                                                    display: "flex",
                                                                                    alignItems:
                                                                                        "center",
                                                                                    gap: 1,
                                                                                    mb: 0.5,
                                                                                }}
                                                                            >
                                                                                <Chip
                                                                                    size="small"
                                                                                    color={
                                                                                        message.from ===
                                                                                        "human"
                                                                                            ? "success"
                                                                                            : "default"
                                                                                    }
                                                                                    label={
                                                                                        message.from ===
                                                                                        "human"
                                                                                            ? "Received from user"
                                                                                            : "Sent to user"
                                                                                    }
                                                                                />
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    color="text.secondary"
                                                                                >
                                                                                    {new Date(
                                                                                        message.createdAt,
                                                                                    ).toLocaleString()}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography variant="body2">
                                                                                {message.message.body?.trim() ||
                                                                                    "(No message body)"}
                                                                            </Typography>
                                                                            {message.message
                                                                                .image_links
                                                                                ?.length ? (
                                                                                <Stack
                                                                                    spacing={0.5}
                                                                                    sx={{
                                                                                        mt: 0.75,
                                                                                    }}
                                                                                >
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        color="text.secondary"
                                                                                    >
                                                                                        Attachments
                                                                                    </Typography>
                                                                                    {message.message.image_links.map(
                                                                                        (url) => (
                                                                                            <Link
                                                                                                key={
                                                                                                    url
                                                                                                }
                                                                                                href={
                                                                                                    url
                                                                                                }
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                            >
                                                                                                {url}
                                                                                            </Link>
                                                                                        ),
                                                                                    )}
                                                                                </Stack>
                                                                            ) : null}
                                                                            <Divider sx={{ mt: 1.25 }} />
                                                                        </Box>
                                                                    ),
                                                                )}

                                                                {interaction.medium ===
                                                                "call_poku" ? (
                                                                    <Stack spacing={1}>
                                                                        <Typography variant="subtitle2">
                                                                            Call details
                                                                        </Typography>
                                                                        {interaction.call
                                                                            ?.recordingUrl ? (
                                                                            <audio
                                                                                controls
                                                                                src={
                                                                                    interaction.call.recordingUrl
                                                                                }
                                                                            >
                                                                                Your browser does
                                                                                not support audio
                                                                                playback.
                                                                            </audio>
                                                                        ) : (
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                            >
                                                                                No recording URL
                                                                                available.
                                                                            </Typography>
                                                                        )}
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                whiteSpace:
                                                                                    "pre-wrap",
                                                                            }}
                                                                        >
                                                                            {interaction.call?.transcript?.trim() ||
                                                                                "No transcript available."}
                                                                        </Typography>
                                                                    </Stack>
                                                                ) : null}
                                                            </Stack>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={totalRows}
                            page={page}
                            onPageChange={handlePageChange}
                            rowsPerPage={pageSize}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                        />
                    </Paper>
                ) : null}
            </Stack>
        </Box>
        </ThemeProvider>
    );
}
