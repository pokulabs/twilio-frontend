import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/joy";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";

export function CreditsRemaining() {
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const credits = await apiClient.getAccountCredits();
        if (credits.data) {
          setCreditsRemaining(credits.data.creditsRemaining ?? 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

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
        gap: 1,
      }}
    >
      <Typography
        level="body-sm"
        sx={{ mb: 0 }}
        endDecorator={
          <InfoTooltip
            title={
              <Typography level="body-sm" color="warning">
                1 credit per message<br />10 credits per voice call
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
    </Box>
  );
}
