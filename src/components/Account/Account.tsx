import { Box } from "@mui/joy";

import ApiKey from "./ApiKey";
import withLoggedIn from "../../context/withLoggedIn";

function Account() {
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
      <ApiKey />
    </Box>
  );
}

export default withLoggedIn(Account, "Account");
