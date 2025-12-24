import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Sheet, Typography } from "@mui/joy";
import { apiClient } from "../../api-client";
import { useAuth } from "../../hooks/use-auth";
import { ActiveInteractions } from "../Hitl/ActiveInteractions";
import { InteractionCard, type InteractionCardData } from "../Hitl/InteractionCard";

type PublicReplyInfo = InteractionCardData & {
  secondsRemaining: number;
  expired: boolean;
  alreadyResponded: boolean;
};

export default function PublicReply() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<PublicReplyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [now, setNow] = useState(() => Date.now());

  // Update "now" every second for timer display
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch interaction info on mount
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiClient.getPublicReply(token);
        const data = res?.data;
        if (!data) {
          setError("Invalid or expired link");
          setInfo(null);
          return;
        }
        setInfo(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (response: string) => {
    if (!token) return;
    setStatus("submitting");
    setError(null);
    try {
      await apiClient.submitPublicReply(token, response);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setError(e?.response?.data?.error || "Failed to submit response");
      throw e; // Re-throw so InteractionCard knows it failed
    }
  };

  if (status === "success") {
    return (
      <Sheet
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          mx: "auto",
          width: "100%",
        }}
      >
        <Box>
          <Typography level="h3" sx={{ mb: 1 }}>
            Thanks!
          </Typography>
          <Typography level="body-lg">
            Your response has been recorded.
          </Typography>
        </Box>
      </Sheet>
    );
  }

  // If still determining auth status or loading token info, show spinner
  if (authLoading || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          pt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If logged in, show the full Active Interactions dashboard with this interaction focused
  if (isAuthenticated && info?.id) {
    return (
      <Box sx={{ flex: 1, width: "100%", p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 } }}>
        <ActiveInteractions focusedInteractionId={info.id} />
      </Box>
    );
  }

  // If logged out, show the public single-interaction reply UI
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        p: { xs: 2, md: 4 },
        pt: { xs: 10, md: 12 },
      }}
    >
      <Typography level="title-lg" sx={{ mb: 2 }}>
        Reply to Request
      </Typography>

      {error ? (
        <Sheet
          variant="outlined"
          sx={{ borderRadius: 8, p: 4, textAlign: "center" }}
        >
          <Typography level="body-md" color="danger">
            {error}
          </Typography>
        </Sheet>
      ) : info ? (
        info.alreadyResponded ? (
          <Sheet
            variant="outlined"
            sx={{ borderRadius: 8, p: 4, textAlign: "center" }}
          >
            <Typography level="body-md" sx={{ color: "neutral.700" }}>
              A response has already been recorded for this request.
            </Typography>
          </Sheet>
        ) : (
          <InteractionCard
            interaction={info}
            now={now}
            onSubmit={handleSubmit}
            isSubmitting={status === "submitting"}
          />
        )
      ) : null}
    </Box>
  );
}
