import React from "react";
import { Alert, Box, Card } from "@mui/joy";
import LoginButton from "../components/LoginButton";
import { authClient } from "./Auth";

const withLoggedIn = <P extends object>(
  Component: React.ComponentType<P>,
  area: string,
  inline = false,
) => {
  return (props: P) => {
    const { data } = authClient.useSession();

    if (!data) {
      return (
        <Box
          component="form"
          sx={{
            display: "flex",
            marginTop: inline ? "" : 20,
            flexDirection: "column",
            alignItems: "center",
            p: inline ? "" : 2,
            mx: inline ? "" : "auto",
            width: "100%",
          }}
        >
          <Card sx={{ pb: 5, minWidth: 400 }}>
            <Alert
              variant="outlined"
              color="warning"
              sx={{ mb: 2, justifyContent: "center" }}
            >
              Login to access {area}.
            </Alert>
            <LoginButton />
          </Card>
        </Box>
      );
    }

    return <Component {...props} />;
  };
};

export default withLoggedIn;
