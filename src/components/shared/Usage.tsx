import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    ModalDialog,
    FormControl,
    FormLabel,
    Input,
    Stack,
    ModalClose,
    Link,
    Alert,
    CircularProgress,
} from "@mui/joy";
import { CheckCircleRounded, BlockRounded, WarningRounded } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";
import { convertCreditsToCents } from "../../types/backend-frontend";
import { CreateButton } from "./CreateButton";

interface AutoRechargeModalProps {
    open: boolean;
    onClose: () => void;
    currentSettings: {
        enabled: boolean;
        amount: number;
        threshold: number;
    };
    onSave: () => void;
}

function AutoRechargeModal({
    open,
    onClose,
    currentSettings,
    onSave,
}: AutoRechargeModalProps) {
    const [amount, setAmount] = useState(currentSettings.amount);
    const [threshold, setThreshold] = useState(currentSettings.threshold);
    const [hasValidPaymentMethod, setHasValidPaymentMethod] = useState<boolean | null>(null);
    const [isCheckingPaymentMethod, setIsCheckingPaymentMethod] = useState(false);

    const isCurrentlyEnabled = currentSettings.enabled;

    // Reset local state and check payment method when modal opens
    useEffect(() => {
        if (open) {
            setAmount(currentSettings.amount);
            setThreshold(currentSettings.threshold);
            
            // Check payment method status when modal opens
            const checkPaymentMethod = async () => {
                setIsCheckingPaymentMethod(true);
                try {
                    const res = await apiClient.checkPaymentMethodStatus();
                    setHasValidPaymentMethod(res.data?.hasValidPaymentMethod ?? false);
                } catch {
                    setHasValidPaymentMethod(false);
                } finally {
                    setIsCheckingPaymentMethod(false);
                }
            };
            checkPaymentMethod();
        } else {
            // Reset payment method state when modal closes
            setHasValidPaymentMethod(null);
        }
    }, [open, currentSettings]);

    const isAmountValid = amount >= 200;
    const isThresholdValid = threshold >= 50;
    // Can only enable if there's a valid payment method
    const canEnable = isAmountValid && isThresholdValid && hasValidPaymentMethod === true;
    // Can update settings if already enabled (just saving new values)
    const canSave = isAmountValid && isThresholdValid;

    const handleUpdate = async (enabled: boolean) => {
        if (!canSave) return;
        await apiClient.updateAutoRecharge({
            enabled,
            amount,
            threshold,
        });
        onSave();
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4">
                    {isCurrentlyEnabled ? "Auto-Recharge Settings" : "Enable Auto-Recharge"}
                </Typography>
                <Stack spacing={2}>
                    <FormControl error={!isThresholdValid}>
                        <FormLabel>When credits fall below</FormLabel>
                        <Input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            endDecorator="credits"
                            slotProps={{
                                input: {
                                    min: 50,
                                },
                            }}
                        />
                        <Typography level="body-xs" color={!isThresholdValid ? "danger" : "neutral"}>
                            Minimum 50 credits
                        </Typography>
                    </FormControl>
                    <FormControl error={!isAmountValid}>
                        <FormLabel>Automatically add</FormLabel>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            endDecorator="credits"
                            slotProps={{
                                input: {
                                    min: 200,
                                },
                            }}
                        />
                        <Typography level="body-xs" mt={0.5}>
                            (${ (convertCreditsToCents(amount) / 100).toFixed(2) } USD)
                        </Typography>
                        <Typography level="body-xs" color={!isAmountValid ? "danger" : "neutral"}>
                            Minimum 200 credits
                        </Typography>
                    </FormControl>
                    {isCheckingPaymentMethod ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size="sm" />
                            <Typography level="body-sm">Checking payment method...</Typography>
                        </Box>
                    ) : hasValidPaymentMethod === false ? (
                        <Alert
                            color="warning"
                            startDecorator={<WarningRounded />}
                            sx={{ mt: 1 }}
                        >
                            <Typography level="body-sm">
                                No valid payment method found. Auto-recharge requires a payment method on file.{" "}
                                <Link
                                    href="https://billing.stripe.com/p/login/dRm9AV51Q1YrbOHb60eEo00"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Add payment method
                                </Link>
                            </Typography>
                        </Alert>
                    ) : (
                        <Typography level="body-sm" color="success">
                            ✓ Valid payment method on file
                        </Typography>
                    )}
                    {isCurrentlyEnabled ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <CreateButton
                                onCreate={() => handleUpdate(true)}
                                disabled={!canSave}
                                texts={{ idle: "Update Settings" }}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="soft"
                                color="danger"
                                onClick={() => handleUpdate(false)}
                            >
                                Disable
                            </Button>
                        </Box>
                    ) : (
                        <CreateButton
                            onCreate={() => handleUpdate(true)}
                            disabled={!canEnable}
                            texts={{ idle: "Enable Auto-Recharge" }}
                        />
                    )}
                </Stack>
            </ModalDialog>
        </Modal>
    );
}

export function CreditsRemaining() {
    const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    
    // Server state
    const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
    const [autoRechargeAmount, setAutoRechargeAmount] = useState(0);
    const [autoRechargeThreshold, setAutoRechargeThreshold] = useState(0);
    
    const [isAutoRechargeModalOpen, setIsAutoRechargeModalOpen] = useState(false);

    const fetchLimits = async () => {
        const credits = await apiClient.getAccountCredits();
        if (credits.data) {
            setCreditsRemaining(credits.data.creditsRemaining);
            setAutoRechargeEnabled(credits.data.autoRechargeEnabled);
            setAutoRechargeAmount(credits.data.autoRechargeAmount);
            setAutoRechargeThreshold(credits.data.autoRechargeThreshold);
        }
    };

    useEffect(() => {
        fetchLimits();
    }, []);

    const handleAddCredits = async () => {
        setIsCheckoutLoading(true);
        try {
            const response = await apiClient.createCheckoutSession();
            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            console.error("Failed to create checkout session", err);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
            }}
        >
            <Typography
                level="body-md"
                sx={{ mb: 0 }}
                endDecorator={
                    <InfoTooltip
                        title={
                            <Typography level="body-sm" color="warning">
                                1 credit per message
                                <br />
                                10 credits per voice call
                            </Typography>
                        }
                    />
                }
            >
                Credits: {creditsRemaining ?? "--"}
            </Typography>
            <Button
                size="sm"
                variant="soft"
                loading={isCheckoutLoading}
                onClick={handleAddCredits}
            >
                Add credits
            </Button>
            <Button
                size="sm"
                variant="plain"
                startDecorator={
                    autoRechargeEnabled ? (
                        <CheckCircleRounded color="success" />
                    ) : (
                        <BlockRounded color={"danger" as any}/>
                    )
                }
                onClick={() => setIsAutoRechargeModalOpen(true)}
            >
                Auto-recharge
            </Button>

            <AutoRechargeModal
                open={isAutoRechargeModalOpen}
                onClose={() => setIsAutoRechargeModalOpen(false)}
                currentSettings={{
                    enabled: autoRechargeEnabled,
                    amount: autoRechargeAmount,
                    threshold: autoRechargeThreshold,
                }}
                onSave={() => fetchLimits()}
            />
        </Box>
    );
}
