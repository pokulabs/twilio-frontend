import { useState } from "react";
import { Button, Typography, Input, Stack, Alert, Tooltip, Box } from "@mui/joy";
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
      <Typography level="body-md" sx={{ mb: 2 }}>
        Generating an API key will invalidate any previous one.
      </Typography>

      {apiKey ? (
        <Stack spacing={2}>
          <Alert color="warning" variant="soft">
            Save your key securely. This is the only time it will be shown.
          </Alert>
          <Input
            readOnly
            value={apiKey}
            endDecorator={
              <Tooltip title={copied ? "Copied!" : "Copy"}>
                <Button size="sm" onClick={handleCopy}>
                  {copied ? "✓" : "Copy"}
                </Button>
              </Tooltip>
            }
          />
        </Stack>
      ) : (
        <Button color="primary" onClick={handleGenerate} sx={{ width: "300px" }}>
          Generate API Key
        </Button>
      )}
    </Box>
  );
}
