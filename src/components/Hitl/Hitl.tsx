import { Box } from "@mui/joy";

import LlmKey from "./LlmKey";
import DecisionAgent from "./Agent";
import withLoggedIn from "../../context/withLoggedIn";

function Hitl() {
  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 5,
        flexDirection: "column",
        p: 4,
        gap: 5,
        width: "100%",
        maxWidth: 500,
      }}
    >
      <LlmKey />
      <DecisionAgent />
    </Box>
  );
}

export default withLoggedIn(Hitl);
