import { useEffect, useState } from "react";
import { apiClient } from "../../api-client";
import DecisionAgent from "./Agent";
import LlmKey from "./LlmKey";
import withLoggedIn from "../../context/withLoggedIn";
import { Box, Link, Typography } from "@mui/joy";

function Flagging() {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiClient
      .checkLlmKeyExists()
      .then((res) => {
        setIsSaved(!!res.data?.key);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 5,
        flexDirection: "column",
        p: 2,
        width: "100%",
        maxWidth: 500,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box>
          <Typography>
            Automatically flag messages for review based on your own rules,
            using your own OpenAI Key.
          </Typography>
          <Typography>
            Learn more{" "}
            <Link
              href="https://www.pokulabs.com/guides/conversation-flagging"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </Link>
            .
          </Typography>
        </Box>
        <LlmKey isSaved={isSaved} setIsSaved={setIsSaved} />
        <DecisionAgent hasLlmKey={isSaved} />
      </Box>
    </Box>
  );
}

export default withLoggedIn(Flagging);
