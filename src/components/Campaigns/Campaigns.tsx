import { GoogleLogin } from "@react-oauth/google";
import { Box, Card, Typography } from "@mui/joy";

import { useAuth } from "../../context/AuthContext";
import NewCampaign from "./NewCampaign";
import { apiClient } from "../../api-client";
import { useEffect } from "react";

export default function Campaigns() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient.getCampaigns();
      console.log(res.data);
    };

    fetch();
  }, []);

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
        <NewCampaign />
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

        <Typography>Some Poku features require an account to work.</Typography>
      </Card>
    </Box>
  );
}
