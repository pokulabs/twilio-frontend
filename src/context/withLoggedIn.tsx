import React from "react";
import { Alert, Box, Button } from "@mui/joy";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const withLoggedIn = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated } = useAuth();

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
            To access Human Intervention, you must first login to Poku.
          </Alert>
          <Button
            variant="solid"
            sx={{ width: "100%" }}
            component={Link}
            to="/account"
          >
            Go to Account Page
          </Button>
        </Box>
      );
    }
    return <Component {...props} />;
  };
};

export default withLoggedIn;
