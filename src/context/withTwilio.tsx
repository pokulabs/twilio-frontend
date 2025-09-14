import React from "react";
import { Box, CircularProgress } from "@mui/joy";
import { useTwilio } from "./TwilioProvider";
import { TwilioForm } from "../components/Integrations/TwilioForm";

const withTwilio = <P extends object>(Component: React.ComponentType<P>) => {
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
          <TwilioForm />
        </Box>
      );
    }
    return <Component {...props} />;
  };
};

export default withTwilio;
