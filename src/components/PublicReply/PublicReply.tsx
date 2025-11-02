import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Button, Sheet, Textarea, Typography } from "@mui/joy";

export default function PublicReply() {
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!token || !message.trim()) return;
    setStatus("submitting");
    setError(null);
    try {
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: false,
      });
      await api.post(`/public/reply/${token}`, { message });
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setError(e?.response?.data?.error || "Failed to submit response");
    }
  };

  if (status === "success") {
    return (
      <Sheet sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box sx={{ maxWidth: 560 }}>
          <Typography level="h3" sx={{ mb: 1 }}>Thanks!</Typography>
          <Typography level="body-lg">Your response has been recorded.</Typography>
        </Box>
      </Sheet>
    );
  }

  return (
    <Sheet sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 680 }}>
        <Typography level="h3" sx={{ mb: 1 }}>Reply to the request</Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: "neutral.500" }}>
          Enter your response below and submit.
        </Typography>
        <Textarea minRows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your response..." />
        {status === "error" && (
          <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>{error}</Typography>
        )}
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button onClick={handleSubmit} loading={status === "submitting"} disabled={!message.trim()}>
            Submit response
          </Button>
        </Box>
      </Box>
    </Sheet>
  );
}


