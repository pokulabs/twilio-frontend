import { Box, Typography, Card, Button, Stack, Divider } from "@mui/joy";
import ApiKey from "./ApiKey";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";

function Account() {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 5,
        flexDirection: "column",
        p: 4,
        width: "100%",
        maxWidth: 900,
        gap: 3,
      }}
    >
      <Typography level="h4" sx={{ mt: 4, mb: 2, textAlign: "center" }}>
        Welcome to Poku!
      </Typography>

      <Stack direction="row" spacing={3}>
        <Card sx={{ flex: 1 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Human-in-the-Loop Tools
          </Typography>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Enable your AI agent to text a human for help in real-time during
            any conversation or workflow.
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            Add a human approval step before your agent uses a custom tool or
            function.
          </Typography>

          <Stack sx={{ mt: "auto" }}>
            {isAuthenticated ? (
              <Button variant="outlined" component={Link} to="/hitl">
                Human Intervention
              </Button>
            ) : (
              <Button component={Link} to="/login?redirect=%2Fhitl">
                Login
              </Button>
            )}
          </Stack>
        </Card>

        <Card sx={{ flex: 1 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Twilio SMS Inbox
          </Typography>
          <Typography level="body-sm">
            A free, consolidated inbox for your Twilio (SMS & WhatsApp)
            messages. Send and receive messages, and track conversations in a
            clean chat interface.
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            No Poku account required!
          </Typography>

          <Button
            variant="outlined"
            component={Link}
            to="/messages"
            sx={{ mt: "auto" }}
          >
            Messages
          </Button>
        </Card>
      </Stack>

      <Divider />

      <Stack sx={{ maxWidth: 500 }}>{isAuthenticated && <ApiKey />}</Stack>
    </Box>
  );
}

export default Account;
