import { Box, Button, Card, Typography } from "@mui/joy";
import { useAuth } from "../../context/AuthContext";
import NewCampaign from "./NewCampaign";
import CampaignsTable from "./CampaignsTable";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";

export default function Campaigns() {
  const { isAuthenticated } = useAuth();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient.getCampaigns();
      console.log(res.data);
      setCampaigns(res.data);
    };
    fetch();
  }, []);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{ marginTop: 20, p: 3, mx: "auto", width: "100%", maxWidth: 400 }}
      >
        <Card sx={{ pb: 5 }}>
          <Typography level="h3" sx={{ mb: 2, textAlign: "center" }}>
            Account
          </Typography>
          <Typography>
            Some Poku features require an account to work.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: "100%", maxWidth: creatingNew ? 500 : 1000 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {!creatingNew && (
          <Button onClick={() => setCreatingNew(true)}>New Campaign</Button>
        )}
      </Box>

      {creatingNew ? (
        <NewCampaign
          onComplete={() => setCreatingNew(false)}
          onCancel={() => setCreatingNew(false)}
        />
      ) : campaigns.length > 0 ? (
        <CampaignsTable campaigns={campaigns} />
      ) : (
        <Typography>
          No campaigns yet. Click "New Campaign" to get started.
        </Typography>
      )}
    </Box>
  );
}
