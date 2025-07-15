import * as React from "react";
import { Alert, Input, Button, Typography, Stack } from "@mui/joy";
import { useAuth } from "react-oidc-context";

import { useTwilio } from "../../context/TwilioProvider";
import Whatsapp from "./Whatsapp";
import { apiClient } from "../../api-client";

export function TwilioIntegrationForm() {
  return (
    <Stack direction="column" spacing={6}>
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
    <Stack direction="column" spacing={2}>
      <Typography level="h4">Twilio Credentials</Typography>
      <Alert variant="outlined" color="success">
        Your credentials are stored safely in this browser, or encrypted in our
        database if you're signed in.
        <br />
        You can check the code!
      </Alert>

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
