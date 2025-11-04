import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/joy";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";

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
    <Box>
      <Typography
        level="body-sm"
        sx={{ mb: 1 }}
        endDecorator={
          <InfoTooltip
            title={
              <Box>
                <Typography level="body-sm" color="warning" sx={{ mb: 1 }}>
                  1 credit per message. 5 credits per voice call.
                  <br />
                  Add more credits{" "}
                  <a
                    href="https://buy.stripe.com/8x2dRb9i66eH3ib6PKeEo02"
                    target="_blank"
                  >
                    here
                  </a>
                </Typography>
              </Box>
            }
          />
        }
      >
        Credits remaining: {creditsRemaining ?? "--"}
      </Typography>
    </Box>
  );
}
