import { Box, Typography, Button, Stack, Alert } from "@mui/joy";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import { Cancel } from "@mui/icons-material";

export default function UsagePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"success" | "canceled" | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setStatus("success");
    } else if (searchParams.get("canceled") === "true") {
      setStatus("canceled");
    }
  }, [searchParams]);

  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 5,
        flexDirection: "column",
        p: 4,
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        gap: 3,
      }}
    >
      <Typography level="h4" sx={{ textAlign: "center" }}>
        Checkout
      </Typography>

      {status === "success" && (
        <Alert
          variant="soft"
          color="success"
          startDecorator={<CheckCircle />}
          sx={{ alignItems: "flex-start" }}
        >
          <Box>
            <Typography level="title-md">Payment Successful</Typography>
            <Typography level="body-sm">
              Your credits have been added to your account.
            </Typography>
          </Box>
        </Alert>
      )}

      {status === "canceled" && (
        <Alert
          variant="soft"
          color="danger"
          startDecorator={<Cancel />}
          sx={{ alignItems: "flex-start" }}
        >
          <Box>
            <Typography level="title-md">Payment Canceled</Typography>
            <Typography level="body-sm">
              The checkout process was canceled. No charges were made.
            </Typography>
          </Box>
        </Alert>
      )}

      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Button component={Link} to="/" variant="plain">
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}

