import { Check } from "@mui/icons-material";
import { Button, Input, Stack, Typography, Link, Box } from "@mui/joy";
import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import withLoggedIn from "../../context/withLoggedIn";
import { InfoTooltip } from "../shared/InfoTooltip";

function Vapi() {
  const [vapiKey, setVapiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .checkVapiKeyExists()
      .then((res) => {
        setIsSaved(!!res.data?.key);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    await apiClient.createVapiKey(vapiKey);
    setIsSaved(true);
  };
  return (
    <Stack spacing={1}>
      <Box>
        <Typography>
          This integration lets your Vapi agent receive messages while on a
          phone call, such as texts.
        </Typography>
        <Typography>
          Learn more{" "}
          <Link
            href="https://docs.google.com/presentation/d/1PMpEqUr7KLtKtcKFnwFGmj_yTf4-D3BwpWkIU9AmiJs/edit?slide=id.g36ac38dd284_0_77#slide=id.g36ac38dd284_0_77"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </Link>
          .
        </Typography>
      </Box>
      <Typography
        level="h4"
        endDecorator={
          <InfoTooltip
            title={
              <Typography level="body-md" color="neutral">
                <b>Why we need this</b>
                <br />
                We use your Vapi API Key to find in-progress conversations and
                inject real-time messages into them.
              </Typography>
            }
          />
        }
      >
        Vapi API Key
      </Typography>

      {isSaved ? (
        <Typography
          level="body-md"
          sx={{ mb: 2 }}
          endDecorator={<Check color="success" />}
        >
          API key saved
        </Typography>
      ) : (
        <Typography level="body-md" sx={{ mb: 2 }}>
          Enter your Vapi API key
        </Typography>
      )}

      <Input
        value={vapiKey}
        onChange={(e) => setVapiKey(e.target.value)}
        placeholder={isSaved ? "Enter a new key to replace it" : ""}
        type="password"
      />
      <Button onClick={handleSave} disabled={!vapiKey}>
        Save
      </Button>
    </Stack>
  );
}

export default withLoggedIn(Vapi);
