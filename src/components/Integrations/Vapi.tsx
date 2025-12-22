import { Alert, Button, Input, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import withLoggedIn from "../../context/withLoggedIn";

function Vapi() {
  const [vapiKey, setVapiKey] = useState("");
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
    await apiClient.createVapiKey(vapiKey);
    setIsSaved(true);
  };

  return (
    <Stack direction="column" gap={1}>
      <Typography level="h4">Vapi API Key</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        This integration lets you inject context into your live Vapi agent.
      </Typography>

      <Input
        placeholder={isSaved ? "Enter a new key to replace it" : "Vapi API Key"}
        value={vapiKey}
        onChange={(e) => setVapiKey(e.target.value)}
        type="password"
      />
      <Button variant="solid" onClick={handleSave} disabled={!vapiKey}>
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

export default withLoggedIn(Vapi);
