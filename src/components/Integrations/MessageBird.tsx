import { Alert, Button, Input, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";

export default function MessageBird() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .getMessageBirdCreds()
      .then((res) => {
        if (res.data?.id) {
          setWorkspaceId(res.data.id);
          setIsSaved(true);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    await apiClient.createMessageBirdKey(workspaceId, apiKey);
    setIsSaved(true);
    setApiKey("");
  };

  return (
    <Stack direction="column" gap={1}>
      <Typography level="h4">Bird</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        Connect a Bird workspace to use your numbers for outbound WhatsApp messages.
      </Typography>

      <Input
        placeholder="Bird Workspace ID"
        value={workspaceId}
        onChange={(e) => setWorkspaceId(e.target.value)}
      />
      <Input
        placeholder={isSaved ? "Enter a new key to replace it" : "Bird Access Key"}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        type="password"
      />
      <Button
        variant="solid"
        onClick={handleSave}
        disabled={!workspaceId || !apiKey}
      >
        Save
      </Button>
      {isSaved && (
        <Alert variant="soft" color="success">
          MessageBird credentials saved!
        </Alert>
      )}
    </Stack>
  );
}
