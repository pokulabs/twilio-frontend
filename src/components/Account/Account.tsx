import { GoogleLogin } from "@react-oauth/google";
import { Box, Card, Typography } from "@mui/joy";

import { useAuth } from "../../context/AuthContext";
import ApiKey from "./ApiKey";
import { apiClient } from "../../api-client";

export default function Account() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          marginTop: 5,
          flexDirection: "column",
          p: 4,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <ApiKey />
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 20, p: 3, mx: "auto", width: "100%", maxWidth: 400 }}>
      <Card
        sx={{
          pb: 5,
        }}
      >
        <Typography level="h3" sx={{ mb: 2, textAlign: "center" }}>
          Account
        </Typography>

        <Typography>
          Some Poku features require an account to work:
          <br />
          &bull; Chat toggle
          <br />
          &bull; Decision agent (coming soon)
        </Typography>
        <Login />
      </Card>
    </Box>
  );
}

function Login() {
  const { login } = useAuth();

  return (
    <>
      <Typography sx={{ mb: 2 }}>
        You can sign in with your Google account:
      </Typography>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await apiClient.login(credentialResponse);
            const { accessToken, user } = res.data;
            login(accessToken, user);
          } catch (err) {
            console.error("Login failed:", err);
          }
        }}
        onError={() => {
          console.error("Google login failed");
        }}
        size="medium"
        // width={360}
        //   useOneTap
      />
    </>
  );
}
