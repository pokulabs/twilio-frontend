import { useEffect, useState } from "react";
import { Button, Typography, Input, Stack } from "@mui/joy";
import { apiClient } from "../../api-client";
import { Check } from "@mui/icons-material";

export default function LlmKey() {
  const [llmKey, setLlmKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .checkLlmKeyExists()
      .then((res) => {
        setIsSaved(res.data.hasKey);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    await apiClient.createLlmKey(llmKey);
    setIsSaved(true);
  };

  return (
    <Stack spacing={1}>
      <Typography level="h4" gutterBottom>
        LLM Key
      </Typography>

      {isSaved ? (
        <Typography
          level="body-md"
          sx={{ mb: 2 }}
          endDecorator={<Check color="success" />}
        >
          OpenAI API key already saved
        </Typography>
      ) : (
        <Typography level="body-md" sx={{ mb: 2 }}>
          Enter your OpenAI API key
        </Typography>
      )}

      <Input
        value={llmKey}
        onChange={(e) => setLlmKey(e.target.value)}
        placeholder={isSaved ? "Enter a new key to replace it" : ""}
      />
      <Button onClick={handleSave} disabled={!llmKey}>
        Save
      </Button>
    </Stack>
  );
}
