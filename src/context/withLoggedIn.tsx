import React from "react";
import { Alert, Box, Button, Card } from "@mui/joy";
import { useAuth } from "react-oidc-context";

const withLoggedIn = <P extends object>(
  Component: React.ComponentType<P>,
  area: string,
  inline = false,
) => {
  return (props: P) => {
    const { isAuthenticated, signinRedirect } = useAuth();

    if (!isAuthenticated) {
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
            maxWidth: 400,
          }}
        >
          <Card sx={{ pb: 5 }} >

            <Alert
              variant="outlined"
              color="warning"
              sx={{ mb: 2, textAlign: "center" }}
            >
              To access {area}, you must first login to Poku.
            </Alert>
            <Button
              variant="solid"
              onClick={() => {
                signinRedirect();
              }}
            >
              Login
            </Button>
          </Card>
        </Box>
      );
    }

    return <Component {...props} />;
  };
};

export default withLoggedIn;
