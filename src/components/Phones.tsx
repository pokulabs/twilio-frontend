import { useCallback, useEffect, useState } from "react";
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
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";
import {
    apiClient,
    type AvailablePhoneNumber,
    type ReservedPhoneNumber,
} from "../api-client";
import { appTheme } from "../theme";

const DEFAULT_LIMIT = 20;
const COUNTRY_OPTIONS = ["US", "GB"] as const;
type CountryCode = (typeof COUNTRY_OPTIONS)[number];

export default function Phones() {
    const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>(
        [],
    );
    const [reservedNumbers, setReservedNumbers] = useState<ReservedPhoneNumber[]>([]);
    const [country, setCountry] = useState<CountryCode>("US");
    const [areaCodeInput, setAreaCodeInput] = useState("");
    const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
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
        const parsedLimit = Number(limitInput);
        const limit = Number.isFinite(parsedLimit)
            ? Math.min(50, Math.max(1, parsedLimit))
            : DEFAULT_LIMIT;

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
                limit,
            });
            setAvailableNumbers(res.data ?? []);
        } catch {
            setErrorText("Failed to load available phone numbers.");
        } finally {
            setIsLoadingAvailable(false);
        }
    }, [country, areaCodeInput, limitInput]);

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

    return (
        <ThemeProvider theme={appTheme}>
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
                                <TextField
                                    label="Limit"
                                    value={limitInput}
                                    onChange={(event) => setLimitInput(event.target.value)}
                                    inputProps={{
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        min: 1,
                                        max: 50,
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => void loadAvailableNumbers()}
                                    disabled={isLoadingAvailable}
                                >
                                    {isLoadingAvailable ? "Loading..." : "Refresh list"}
                                </Button>
                            </Box>

                            <List
                                dense
                                sx={{
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    maxHeight: 360,
                                    overflow: "auto",
                                }}
                            >
                                {availableNumbers.length === 0 ? (
                                    <ListItem>
                                        <ListItemText primary="No available numbers found." />
                                    </ListItem>
                                ) : (
                                    availableNumbers.map((number) => (
                                        <ListItem
                                            key={number.phoneNumber}
                                            secondaryAction={
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={
                                                        <ShoppingCartRounded fontSize="small" />
                                                    }
                                                    disabled={
                                                        buyingPhoneNumber === number.phoneNumber
                                                    }
                                                    onClick={() =>
                                                        void handleBuy(number.phoneNumber)
                                                    }
                                                >
                                                    {buyingPhoneNumber === number.phoneNumber
                                                        ? "Reserving..."
                                                        : "Reserve"}
                                                </Button>
                                            }
                                        >
                                            <ListItemText
                                                primary={number.phoneNumber}
                                                secondary={
                                                    [
                                                        number.locality,
                                                        number.region,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") ||
                                                    `${number.country === "GB" ? "UK" : number.country} number`
                                                }
                                            />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
        </ThemeProvider>
    );
}
