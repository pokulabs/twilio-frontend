import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";
import CreateButton from "./CreateButton";

export function CreditsRemaining() {
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

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

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
      }}
    >
      <Box sx={{display: "flex", alignItems: "center"}}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0 }}
        >
          Credits remaining: {creditsRemaining ?? "--"}
        </Typography>
        <InfoTooltip
        title={
          <Typography variant="body2" color="warning">
              1 credit per message. 
              <br />
              10 credits per voice call.
            </Typography>
          }
        />
      </Box>
      <CreateButton
        color="primary"
        variant="outlined"
        sx={{bgcolor: "red"}}
        component="a"
        href="https://buy.stripe.com/8x2dRb9i66eH3ib6PKeEo02"
        target="_blank"
        rel="noopener noreferrer"
      >
        Add credits
      </CreateButton>
    </Box>
  );
}