import { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/joy";
import { apiClient } from "../../api-client";
import { InfoTooltip } from "./InfoTooltip";

export function Usage() {
  const [messageCount, setMessageCount] = useState(0);
  const [messageLimit, setMessageLimit] = useState(0);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const limits = await apiClient.getAccountLimits();
        if (limits.data) {
          setMessageCount(limits.data.haatMessageCount || 0);
          setMessageLimit(limits.data.haatMessageLimit || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLimits();
  }, []);

  const progressValue = messageLimit
    ? Math.min(100, messageCount * (100 / messageLimit))
    : 0;

  return (
    <Box>
      <Typography
        level="body-sm"
        sx={{ mb: 1 }}
        endDecorator={
          <InfoTooltip
            title={
              <Box>
                <Typography level="body-sm" sx={{ mt: 1 }} color="warning">
                  {messageLimit} free msgs/month
                </Typography>
                <Typography level="body-sm" color="warning" sx={{ mb: 1 }}>
                  To increase please fund your account {" "}
                  <a
                    href="https://buy.stripe.com/28E5kF3XMfPh8Cv6PKeEo01"
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
        Usage: {messageCount} / {messageLimit}
      </Typography>
      <LinearProgress determinate value={progressValue} />
    </Box>
  );
}


