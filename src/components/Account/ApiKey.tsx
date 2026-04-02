import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { apiClient } from "../../api-client";

export default function ApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setCopied(false);
    const res = await apiClient.createApiKey();
    setApiKey(res.data.apiKey);
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Generating an API key will invalidate the previous one.
      </Typography>

      {apiKey ? (
        <Stack spacing={2}>
          <Alert severity="warning">
            Save your key securely. This is the only time it will be shown.
          </Alert>
          <TextField
            value={apiKey}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <Tooltip title={copied ? "Copied!" : "Copy"}>
                    <Button size="small" onClick={handleCopy}>
                      {copied ? "✓" : "Copy"}
                    </Button>
                  </Tooltip>
                ),
              },
            }}
          />
        </Stack>
      ) : (
        <Button variant="contained" onClick={handleGenerate} sx={{ width: "300px" }}>
          Generate API Key
        </Button>
      )}
    </Box>
  );
}
