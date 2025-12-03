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
} from "@mui/joy";
import { CheckCircleRounded, BlockRounded } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";

export function CreditsRemaining() {
    const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
    const [autoRechargeAmount, setAutoRechargeAmount] = useState(2000);
    const [autoRechargeThreshold, setAutoRechargeThreshold] = useState(50);
    const [isAutoRechargeModalOpen, setIsAutoRechargeModalOpen] = useState(false);
    const [isSavingAutoRecharge, setIsSavingAutoRecharge] = useState(false);

    const fetchLimits = async () => {
        try {
            const credits = await apiClient.getAccountCredits();
            if (credits.data) {
                setCreditsRemaining(credits.data.creditsRemaining ?? 0);
                setAutoRechargeEnabled(credits.data.autoRechargeEnabled ?? false);
                setAutoRechargeAmount(credits.data.autoRechargeAmount ?? 2000);
                setAutoRechargeThreshold(credits.data.autoRechargeThreshold ?? 50);
            }
        } catch (err) {
            console.error(err);
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

    const handleSaveAutoRecharge = async () => {
        setIsSavingAutoRecharge(true);
        try {
            await apiClient.updateAutoRecharge({
                enabled: autoRechargeEnabled,
                amount: autoRechargeAmount,
                threshold: autoRechargeThreshold,
            });
            setIsAutoRechargeModalOpen(false);
            await fetchLimits();
        } catch (err) {
            console.error("Failed to update auto top-up", err);
        } finally {
            setIsSavingAutoRecharge(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
            }}
        >
            <Typography
                level="body-sm"
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
                        <BlockRounded color="error" />
                    )
                }
                onClick={() => setIsAutoRechargeModalOpen(true)}
            >
                Auto Recharge
            </Button>

            <Modal
                open={isAutoRechargeModalOpen}
                onClose={() => setIsAutoRechargeModalOpen(false)}
            >
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
                                checked={autoRechargeEnabled}
                                onChange={(e) => setAutoRechargeEnabled(e.target.checked)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>When credits fall below</FormLabel>
                            <Input
                                type="number"
                                value={autoRechargeThreshold}
                                onChange={(e) =>
                                    setAutoRechargeThreshold(Number(e.target.value))
                                }
                                endDecorator="credits"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Automatically add (credits)</FormLabel>
                            <Input
                                type="number"
                                value={Math.round(autoRechargeAmount / 2.5)}
                                onChange={(e) =>
                                    setAutoRechargeAmount(Math.round(Number(e.target.value) * 2.5))
                                }
                                endDecorator="credits"
                            />
                            <Typography level="body-xs" mt={0.5}>
                                (${(autoRechargeAmount / 100).toFixed(2)})
                            </Typography>
                        </FormControl>
                        <Button
                            loading={isSavingAutoRecharge}
                            onClick={handleSaveAutoRecharge}
                        >
                            Save
                        </Button>
                    </Stack>
                </ModalDialog>
            </Modal>
        </Box>
    );
}
