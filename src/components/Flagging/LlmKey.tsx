import React, { useState } from "react";
import { Button, Typography, Input, Stack } from "@mui/joy";
import { apiClient } from "../../api-client";
import { Check } from "@mui/icons-material";
import { InfoTooltip } from "../shared/InfoTooltip";

export default function LlmKey(props: {
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isSaved, setIsSaved } = props;
  const [llmKey, setLlmKey] = useState("");

  const handleSave = async () => {
    await apiClient.createLlmKey(llmKey);
    setIsSaved(true);
  };

  return (
    <Stack spacing={1}>
      <Typography
        level="h4"
        endDecorator={
          <InfoTooltip
            title={
              <Typography level="body-md" color="neutral">
                <b>Why we need this</b>
                <br />
                Your OpenAI API Key powers the decision engine behind message
                flagging. It reads inbound/outbound messages and identifies ones
                that match the criteria you set below.
              </Typography>
            }
          />
        }
      >
        OpenAI API Key
      </Typography>

      {isSaved ? (
        <Typography
          level="body-md"
          sx={{ mb: 2 }}
          endDecorator={<Check color="success" />}
        >
          API key saved
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
        type="password"
      />
      <Button onClick={handleSave} disabled={!llmKey}>
        Save
      </Button>
    </Stack>
  );
}
