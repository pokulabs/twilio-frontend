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
    Switch,
    Stack,
    ModalClose,
    Link,
} from "@mui/joy";
import { CheckCircleRounded, BlockRounded } from "@mui/icons-material";
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
    const [enabled, setEnabled] = useState(currentSettings.enabled);
    const [amount, setAmount] = useState(currentSettings.amount);
    const [threshold, setThreshold] = useState(currentSettings.threshold);

    // Reset local state to match prop when modal opens
    useEffect(() => {
        if (open) {
            setEnabled(currentSettings.enabled);
            setAmount(currentSettings.amount);
            setThreshold(currentSettings.threshold);
        }
    }, [open, currentSettings]);

    const isAmountValid = amount >= 200;
    const isThresholdValid = threshold >= 50;
    const canSave = !enabled || (isAmountValid && isThresholdValid);

    const handleSave = async () => {
        if (!canSave) {
            // Should not happen as button should be disabled, but for safety
            throw new Error("Invalid auto recharge settings");
        }
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
                <Typography level="h4">Auto Recharge Settings</Typography>
                <Stack spacing={2}>
                    <FormControl
                        orientation="horizontal"
                        sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                        <FormLabel>Enable Auto Recharge</FormLabel>
                        <Switch
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                    </FormControl>
                    <FormControl error={enabled && !isThresholdValid}>
                        <FormLabel>When credits fall below</FormLabel>
                        <Input
                            type="number"
                            disabled={!enabled}
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
                    <FormControl error={enabled && !isAmountValid}>
                        <FormLabel>Automatically add (credits)</FormLabel>
                        <Input
                            type="number"
                            disabled={!enabled}
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
                    <Typography level="body-sm">
                        <b>Note:</b> Auto-recharge requires a valid payment method on file.{" "}
                        <Link
                            href="https://billing.stripe.com/p/login/dRm9AV51Q1YrbOHb60eEo00"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Manage Billing Settings
                        </Link>
                    </Typography>
                    <CreateButton 
                        onCreate={handleSave} 
                        disabled={!canSave}
                        texts={{ idle: "Save" }}
                    >
                        Save
                    </CreateButton>
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
                Credits remaining: {creditsRemaining ?? "--"}
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
