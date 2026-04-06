import { useCallback, useEffect, useMemo, useState } from "react";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";
import {
    apiClient,
    type AvailablePhoneNumber,
    type ReservedPhoneNumber,
} from "../api-client";

const AVAILABLE_NUMBERS_PAGE_SIZE = 10;
const COUNTRY_OPTIONS = ["US", "GB"] as const;
type CountryCode = (typeof COUNTRY_OPTIONS)[number];

export default function Phones() {
    const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>(
        [],
    );
    const [reservedNumbers, setReservedNumbers] = useState<ReservedPhoneNumber[]>([]);
    const [country, setCountry] = useState<CountryCode>("US");
    const [areaCodeInput, setAreaCodeInput] = useState("");
    const [availableNumbersPage, setAvailableNumbersPage] = useState(0);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [isLoadingReserved, setIsLoadingReserved] = useState(false);
    const [buyingPhoneNumber, setBuyingPhoneNumber] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [successText, setSuccessText] = useState<string | null>(null);

    const loadReservedNumbers = useCallback(async () => {
        setIsLoadingReserved(true);
        try {
            const res = await apiClient.listReservedPhoneNumbers();
            setReservedNumbers(res.data ?? []);
        } finally {
            setIsLoadingReserved(false);
        }
    }, []);

    const loadAvailableNumbers = useCallback(async () => {
        const selectedCountry = country;
        const trimmedAreaCode = areaCodeInput.trim();
        const areaCode =
            trimmedAreaCode.length > 0 ? Number(trimmedAreaCode) : undefined;

        if (
            selectedCountry === "US" &&
            areaCode !== undefined &&
            (!Number.isInteger(areaCode) || areaCode < 100 || areaCode > 999)
        ) {
            setErrorText("Area code must be a 3-digit number.");
            return;
        }

        setErrorText(null);
        setIsLoadingAvailable(true);
        try {
            const res = await apiClient.listAvailablePhoneNumbers({
                country: selectedCountry,
                areaCode: selectedCountry === "US" ? areaCode : undefined,
            });
            setAvailableNumbers(res.data ?? []);
            setAvailableNumbersPage(0);
        } catch {
            setErrorText("Failed to load available phone numbers.");
        } finally {
            setIsLoadingAvailable(false);
        }
    }, [country, areaCodeInput]);

    useEffect(() => {
        void loadReservedNumbers();
        void loadAvailableNumbers();
    }, [loadAvailableNumbers, loadReservedNumbers]);

    const handleBuy = async (phoneNumber: string) => {
        setErrorText(null);
        setSuccessText(null);
        setBuyingPhoneNumber(phoneNumber);
        try {
            await apiClient.reservePhoneNumber(phoneNumber);
            setSuccessText(`Reserved ${phoneNumber}.`);
            await Promise.all([loadReservedNumbers(), loadAvailableNumbers()]);
        } catch {
            setErrorText(`Failed to reserve ${phoneNumber}.`);
        } finally {
            setBuyingPhoneNumber(null);
        }
    };

    const handleDelete = async (reservedNumber: ReservedPhoneNumber) => {
        const shouldDelete = window.confirm(
            `Delete reserved number ${reservedNumber.phone_number}?`,
        );
        if (!shouldDelete) {
            return;
        }

        setErrorText(null);
        setSuccessText(null);
        setDeletingId(reservedNumber.id);
        try {
            await apiClient.deleteReservedPhoneNumber(reservedNumber.id);
            setSuccessText(`Deleted ${reservedNumber.phone_number}.`);
            await loadReservedNumbers();
        } catch {
            setErrorText(`Failed to delete ${reservedNumber.phone_number}.`);
        } finally {
            setDeletingId(null);
        }
    };

    const paginatedAvailableNumbers = useMemo(() => {
        const start = availableNumbersPage * AVAILABLE_NUMBERS_PAGE_SIZE;
        return availableNumbers.slice(
            start,
            start + AVAILABLE_NUMBERS_PAGE_SIZE,
        );
    }, [availableNumbers, availableNumbersPage]);

    return (
        <Box
            sx={{
                width: "100%",
                margin: "0 auto",
            }}
        >
            <Stack spacing={2.5}>
                {errorText ? <Alert severity="error">{errorText}</Alert> : null}
                {successText ? <Alert severity="success">{successText}</Alert> : null}

                <Card variant="outlined">
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="subtitle1">
                                    Your reserved numbers
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => void loadReservedNumbers()}
                                    disabled={isLoadingReserved}
                                >
                                    {isLoadingReserved ? "Refreshing..." : "Refresh"}
                                </Button>
                            </Box>
                            <Divider />
                            <List dense sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
                                {reservedNumbers.length === 0 ? (
                                    <ListItem>
                                        <ListItemText primary="No reserved numbers yet." />
                                    </ListItem>
                                ) : (
                                    reservedNumbers.map((reservedNumber) => (
                                        <ListItem
                                            key={reservedNumber.id}
                                            secondaryAction={
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    startIcon={
                                                        <DeleteOutlineRounded fontSize="small" />
                                                    }
                                                    disabled={deletingId === reservedNumber.id}
                                                    onClick={() =>
                                                        void handleDelete(reservedNumber)
                                                    }
                                                >
                                                    {deletingId === reservedNumber.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </Button>
                                            }
                                        >
                                            <ListItemText
                                                primary={reservedNumber.phone_number}
                                                secondary={`Reserved ${new Date(
                                                    reservedNumber.created_at,
                                                ).toLocaleString()}`}
                                            />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Stack>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Find available numbers</Typography>
                            <Autocomplete<CountryCode, false, true, false>
                                options={COUNTRY_OPTIONS}
                                value={country}
                                onChange={(_, value) => {
                                    if (!value) return;
                                    setCountry(value);
                                    setErrorText(null);
                                }}
                                disableClearable
                                sx={{ maxWidth: 320 }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Country" />
                                )}
                                getOptionLabel={(option) =>
                                    `${en[option] || option} +${getCountryCallingCode(option)}`
                                }
                            />
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                {country === "US" ? (
                                    <TextField
                                        label="Area code"
                                        value={areaCodeInput}
                                        onChange={(event) =>
                                            setAreaCodeInput(event.target.value)
                                        }
                                        placeholder="e.g. 415"
                                        inputProps={{
                                            inputMode: "numeric",
                                            pattern: "[0-9]*",
                                        }}
                                    />
                                ) : null}
                                <Button
                                    variant="outlined"
                                    onClick={() => void loadAvailableNumbers()}
                                    disabled={isLoadingAvailable}
                                >
                                    {isLoadingAvailable ? "Loading..." : "Refresh list"}
                                </Button>
                            </Box>

                            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Phone number</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {availableNumbers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    No available numbers found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedAvailableNumbers.map((number) => (
                                                <TableRow key={number.phoneNumber} hover>
                                                    <TableCell>{number.phoneNumber}</TableCell>
                                                    <TableCell>
                                                        {[
                                                            number.locality,
                                                            number.region,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ") ||
                                                            `${number.country === "GB" ? "UK" : number.country} number`}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={
                                                                <ShoppingCartRounded fontSize="small" />
                                                            }
                                                            disabled={
                                                                buyingPhoneNumber ===
                                                                number.phoneNumber
                                                            }
                                                            onClick={() =>
                                                                void handleBuy(
                                                                    number.phoneNumber,
                                                                )
                                                            }
                                                        >
                                                            {buyingPhoneNumber ===
                                                            number.phoneNumber
                                                                ? "Reserving..."
                                                                : "Reserve"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                {availableNumbers.length > 0 ? (
                                    <TablePagination
                                        component="div"
                                        count={availableNumbers.length}
                                        page={availableNumbersPage}
                                        onPageChange={(_, nextPage) =>
                                            setAvailableNumbersPage(nextPage)
                                        }
                                        rowsPerPage={AVAILABLE_NUMBERS_PAGE_SIZE}
                                        rowsPerPageOptions={[]}
                                        labelRowsPerPage=""
                                    />
                                ) : null}
                            </Paper>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}
