import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Input, Button, Typography, Stack } from "@mui/joy";

import { useCredentials } from "../../context/CredentialsContext";

export default function TwilioForm() {
  const {
    setCredentials,
    isAuthenticated,
    sid: sidContext,
    authToken: authTokenContext,
    isLoading,
  } = useCredentials();
  const [sid, setSid] = React.useState(sidContext);
  const [authToken, setAuthToken] = React.useState(authTokenContext);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const credsValid = await setCredentials(sid, authToken);
    if (credsValid) {
      navigate("/");
    }
  };

  return (
    <Stack
      direction="column"
      spacing={2}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography level="h4">Enter Twilio Credentials</Typography>
      <Alert variant="outlined" color="success">
        Your credentials are safe, they never leave this browser. <br />
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
        Submit
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
