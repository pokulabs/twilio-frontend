import React from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/joy";
import { Link } from "react-router-dom";
import { useTwilio } from "./TwilioProvider";

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useTwilio();

    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (!isAuthenticated) {
      return (
        <Box
          component="form"
          sx={{
            display: "flex",
            marginTop: 20,
            flexDirection: "column",
            alignItems: "center",
            p: 2,
            mx: "auto",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Alert
            variant="outlined"
            color="warning"
            sx={{ mb: 2, textAlign: "center" }}
          >
            To access Messages, you must first enter your Twilio credentials.
          </Alert>
          <Button
            variant="solid"
            sx={{ width: "100%" }}
            component={Link}
            to="/integrations"
          >
            Go to Integrations Page
          </Button>
        </Box>
      );
    }
    return <Component {...props} />;
  };
};

export default withAuth;
