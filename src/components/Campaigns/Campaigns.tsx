import { Box, Button, Typography } from "@mui/joy";
import NewCampaign from "./NewCampaign";
import CampaignsTable from "./CampaignsTable";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import { AxiosError } from "axios";
import withLoggedIn from "../../context/withLoggedIn";

function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [propaganda, setPropaganda] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.getCampaigns();
        setCampaigns(res.data);
      } catch (err) {
        if (err instanceof AxiosError && err.status === 401) {
          setPropaganda(true);
        }
      }
    };
    fetch();
  }, []);

  if (propaganda) {
    return (
      <Box sx={{ mt: 10, p: 4, width: "100%", maxWidth: creatingNew ? 500 : 1000 }}>
        Email us at <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a> to access this feature!
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 10, p: 4, width: "100%", maxWidth: creatingNew ? 500 : 1000 }}>
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

export default withLoggedIn(Campaigns, "Campaigns")