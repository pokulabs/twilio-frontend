import * as React from "react";
import { Alert, Input, Button, Typography, Stack } from "@mui/joy";
import { useAuth } from "react-oidc-context";

import { useTwilio } from "../../context/TwilioProvider";
import Whatsapp from "./Whatsapp";
import { apiClient } from "../../api-client";

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
  const { isAuthenticated: isLoggedIn } = useAuth();
  const [sid, setSid] = React.useState(sidContext);
  const [authToken, setAuthToken] = React.useState(authTokenContext);

  const handleSubmit = async () => {
    await setCredentials(sid, authToken);
    if (isLoggedIn) {
      await apiClient.createTwilioKey(sid, authToken);
    }
  };

  return (
    <Stack direction="column" gap={1}>
      <Typography level="h4">Twilio Credentials</Typography>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        A free, consolidated inbox for your Twilio messages. Send and receive
        messages, and track conversations in a clean chat interface.
      </Typography>

      <Input
        placeholder="Twilio SID"
        value={sid}
        onChange={(e) => setSid(e.target.value)}
      />
      <Input
        placeholder="Auth Token"
        type="password"
        value={authToken}
        onChange={(e) => setAuthToken(e.target.value)}
      />
      <Button type="submit" variant="solid" onClick={handleSubmit}>
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
