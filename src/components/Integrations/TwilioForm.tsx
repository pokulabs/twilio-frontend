import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Input, Button, Typography, Stack } from "@mui/joy";

import { useTwilio } from "../../context/TwilioProvider";
import Whatsapp from "./Whatsapp";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api-client";

export default function TwilioForm() {
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
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const credsValid = await setCredentials(sid, authToken);
    if (isLoggedIn) {
      await apiClient.createTwilioKey(sid, authToken);
    }
    if (credsValid) {
      navigate("/");
    }
  };

  return (
    <Stack direction="column" spacing={6}>
      <Stack
        direction="column"
        spacing={2}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography level="h4">Twilio Credentials</Typography>
        <Alert variant="outlined" color="success">
          Your credentials are stored safely in this browser, or encrypted in
          our database if you're signed in.
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
        <Button type="submit" variant="solid">
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

      <Whatsapp />
    </Stack>
  );
}
