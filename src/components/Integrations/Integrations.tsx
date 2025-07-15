import { Box } from "@mui/joy";
import { TwilioIntegrationForm } from "./TwilioForm";

export default function Integrations() {
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
      <TwilioIntegrationForm />
    </Box>
  );
}
