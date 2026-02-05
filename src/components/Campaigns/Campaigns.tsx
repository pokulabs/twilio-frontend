import { Box, Button, Typography, Stack } from "@mui/joy";
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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiClient.getCampaigns({ page: p, pageSize });
      if (!res.data) return;
      setCampaigns(res.data.data ?? []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
      setPage(res.data.pagination?.page ?? p);
    } catch (err) {
      if (err instanceof AxiosError && err.status === 401) {
        setPropaganda(true);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
  }, []);

  const handleCloseNewCampaign = () => {
    setCreatingNew(false);
    void load(1);
  };

  if (propaganda) {
    return (
      <Box
        sx={{ mt: 10, p: 4, width: "100%", maxWidth: creatingNew ? 500 : 1000 }}
      >
        Campaigns allow you to bulk send text messages. Email us at{" "}
        <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a> for access!
      </Box>
    );
  }

  return (
    <Box
      sx={{ mt: 10, p: 4, width: "100%", maxWidth: creatingNew ? 500 : 1000 }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {!creatingNew && (
          <Button onClick={() => setCreatingNew(true)}>New Campaign</Button>
        )}
      </Box>

      {creatingNew ? (
        <NewCampaign
          onComplete={handleCloseNewCampaign}
          onCancel={handleCloseNewCampaign}
        />
      ) : (
        <Stack spacing={2}>
          <CampaignsTable campaigns={campaigns} loading={loading} />
          {!loading && (campaigns.length > 0 || page > 1) && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => void load(page - 1)}
              >
                Prev
              </Button>
              <Typography level="body-sm">
                Page {page} of {totalPages}
              </Typography>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                disabled={loading || page >= totalPages}
                onClick={() => void load(page + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default withLoggedIn(Campaigns);
