import { Alert, Button, Input, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import withLoggedIn from "../../context/withLoggedIn";

function Retell() {
  const [retellKey, setRetellKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .checkVapiKeyExists()
      .then((res) => {
        setIsSaved(!!res.data?.key);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    await apiClient.createRetellKey(retellKey);
    setIsSaved(true);
  };

  return (
    <Stack direction="column" gap={1}>
      <Typography level="h4">Retell API Key</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        This integration lets you inject context into your live Retell agent.
      </Typography>

      <Input
        placeholder={isSaved ? "Enter a new key to replace it" : "Retell API Key"}
        value={retellKey}
        onChange={(e) => setRetellKey(e.target.value)}
        type="password"
      />
      <Button variant="solid" onClick={handleSave} disabled={!retellKey}>
        Save
      </Button>
      {isSaved && (
        <Alert variant="soft" color="success">
          API key saved!
        </Alert>
      )}
    </Stack>
  );
}

export default withLoggedIn(Retell);
