import { useState, useEffect } from "react";
import { Alert, Input, Button, Typography, Stack } from "@mui/joy";

import { useTwilio } from "../../context/TwilioProvider";
import Whatsapp from "./Whatsapp";

export function TwilioIntegrationForm() {
  return (
    <Stack direction="column" spacing={4}>
      <TwilioForm />
      <Whatsapp />
    </Stack>
  );
}

export function TwilioForm() {
  const {
    setCredentials,
    isAuthenticated,
    sid: sidContext,
    authToken: authTokenContext,
    isLoading,
  } = useTwilio();
  const [sidInput, setSidInput] = useState(sidContext ?? "");
  const [authTokenInput, setAuthTokenInput] = useState(authTokenContext ?? "");

  useEffect(() => {
    setSidInput(sidContext ?? "");
    setAuthTokenInput(authTokenContext ?? "");
  }, [sidContext, authTokenContext]);

  return (
    <Stack direction="column" gap={1}>
      <Typography level="h4">Twilio Credentials</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        A free, consolidated inbox for your Twilio messages. Send and receive
        messages, and track conversations in a clean chat interface.
      </Typography>

      <Input
        placeholder="Twilio SID"
        value={sidInput}
        onChange={(e) => setSidInput(e.target.value)}
      />
      <Input
        placeholder="Auth Token"
        type="password"
        value={authTokenInput}
        onChange={(e) => setAuthTokenInput(e.target.value)}
      />
      <Button type="submit" variant="solid" onClick={() => {
        setCredentials(sidInput, authTokenInput);
      }}>
        Save
      </Button>
      {isAuthenticated && !isLoading && (
        <Alert variant="soft" color="success">
          Credentials successfully set!
        </Alert>
      )}
      {!isAuthenticated && !isLoading && (sidContext || authTokenContext) && (
        <Alert variant="soft" color="danger">
          Credentials incorrect!
        </Alert>
      )}
    </Stack>
  );
}
