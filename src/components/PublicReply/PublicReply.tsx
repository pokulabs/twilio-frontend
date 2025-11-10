import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Sheet, Textarea, Typography } from "@mui/joy";
import { apiClient } from "../../api-client";

// TODO: use apiClient (need to be signed in to use it?)
// remove secondsRemaining from api response and share code with "active interactions" page
export default function PublicReply() {
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{
    message: string;
    secondsRemaining: number;
    expired: boolean;
    alreadyResponded: boolean;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let timer: number | undefined;
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
        // Start countdown locally
        if (!data.expired && !data.alreadyResponded) {
          timer = window.setInterval(() => {
            setInfo((prev) => {
              if (!prev) return prev;
              const next = Math.max(0, prev.secondsRemaining - 1);
              return {
                ...prev,
                secondsRemaining: next,
                expired: next === 0 ? true : prev.expired,
              };
            });
          }, 1000);
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const handleSubmit = async () => {
    if (!token || !message.trim()) return;
    setStatus("submitting");
    setError(null);
    try {
      await apiClient.submitPublicReply(token, message);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setError(e?.response?.data?.error || "Failed to submit response");
    }
  };

  if (status === "success") {
    return (
      <Sheet sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2, mx: "auto", width: "100%" }}>
        <Box>
          <Typography level="h3" sx={{ mb: 1 }}>Thanks!</Typography>
          <Typography level="body-lg">Your response has been recorded.</Typography>
        </Box>
      </Sheet>
    );
  }

  return (
    <Sheet sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2, mx: "auto", width: "100%" }}>
      <Box>
        <Typography level="h3" sx={{ mb: 1 }}>Reply to the request</Typography>

        {loading ? (
          <Typography level="body-sm" sx={{ mb: 2, color: "neutral.500" }}>Loading…</Typography>
        ) : error ? (
          <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>{error}</Typography>
        ) : info ? (
          <>
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 8, border: "1px solid", borderColor: "neutral.outlinedBorder" }}>
              <Typography level="body-sm" sx={{ color: "neutral.600" }}>Request</Typography>
              <Typography level="body-md" sx={{ mt: 0.5 }}>{info.message}</Typography>
            </Box>

            {!info.alreadyResponded && !info.expired && (
              <Typography level="body-sm" sx={{ mb: 1, color: "neutral.600" }}>
                Time remaining: {Math.floor(info.secondsRemaining / 60)}:{String(info.secondsRemaining % 60).padStart(2, "0")}
              </Typography>
            )}

            {info.alreadyResponded ? (
              <Typography level="body-md" sx={{ color: "neutral.700" }}>
                A response has already been recorded for this request.
              </Typography>
            ) : info.expired ? (
              <Typography level="body-md" sx={{ color: "neutral.700" }}>
                This request has expired and can no longer accept responses.
              </Typography>
            ) : (
              <>
                <Typography level="body-sm" sx={{ mb: 2, color: "neutral.500" }}>
                  Enter your response below and submit.
                </Typography>
                <Textarea minRows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your response..." />
                {(status === "error") && (
                  <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>{error}</Typography>
                )}
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button onClick={handleSubmit} loading={status === "submitting"} disabled={!message.trim()}>
                    Submit response
                  </Button>
                </Box>
              </>
            )}
          </>
        ) : null}
      </Box>
    </Sheet>
  );
}


