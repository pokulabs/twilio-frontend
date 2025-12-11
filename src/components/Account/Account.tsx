import { Box, Typography, Card, Button, Stack, Link as JoyLink, Divider } from "@mui/joy";
import ApiKey from "./ApiKey";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { CreditsRemaining } from "../shared/Usage";
import { YOUTUBE_LINK } from "../../utils";

function Account() {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 4,
        width: "100%",
        maxWidth: 1200, // Increased max width for the side-by-side cards
        margin: "0 auto", // Center the container
        gap: 4,
      }}
    >
      <Typography level="h2" sx={{ mt: 2 }}>
        Welcome!
      </Typography>

      <Box>
        <Typography level="h4" sx={{ mb: 2 }}>
          What would you like to do?
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              minHeight: 160,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              p: 4,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "md",
                borderColor: "primary.outlinedBorder",
                transform: "translateY(-2px)",
              },
              backgroundColor: "white",
            }}
            component={Link}
            to="/hitl"
            style={{ textDecoration: "none" }}
          >
            <Typography level="h4" fontWeight="lg">
              Human-in-the-Loop for my AI agent
            </Typography>
          </Card>

          <Card
            variant="outlined"
            sx={{
              flex: 1,
              minHeight: 160,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              p: 4,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "md",
                borderColor: "primary.outlinedBorder",
                transform: "translateY(-2px)",
              },
              backgroundColor: "white",
            }}
            component={Link}
            to="/messages"
            style={{ textDecoration: "none" }}
          >
            <Typography level="h4" fontWeight="lg">
              Manage my Twilio SMS in a consolidated inbox
            </Typography>
          </Card>
        </Stack>
      </Box>

      <Box>
        <Typography level="h4" sx={{ mb: 2 }}>
          Need Help?
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <HelpCard
            title="Schedule a Call"
            description="Book a one-on-one session"
            href="https://calendly.com/getpoku/30min"
          />
          <HelpCard
            title="Contact Support"
            description="Email hello@pokulabs.com with questions or feedback"
            href="mailto:hello@pokulabs.com"
          />
          <HelpCard
            title="Tutorial Videos"
            description="Watch our Youtube Videos for demos & walkthroughs"
            href={YOUTUBE_LINK}
          />
        </Stack>
      </Box>

      {isAuthenticated && (
        <Box>
           {/* My Keys & Credits Section */}
          <Card variant="outlined" sx={{ p: 3, backgroundColor: "white" }}>
            <Typography level="h4" sx={{ mb: 3 }}>
              My Credits & API Key
            </Typography>
            
            <Stack spacing={3}>
              <CreditsRemaining />
              <Divider />
              <ApiKey />
            </Stack>
          </Card>
        </Box>
      )}

      {!isAuthenticated && (
         <Box sx={{ mt: 4 }}>
            <Button 
              component={Link} 
              to="/login" 
              size="lg" 
              fullWidth
            >
              Login
            </Button>
         </Box>
      )}
    </Box>
  );
}

function HelpCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        p: 3,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
            boxShadow: "sm",
            borderColor: "neutral.outlinedHoverBorder",
        },
        backgroundColor: "white",
      }}
    >
      <JoyLink 
        overlay 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ color: 'text.primary', textDecoration: 'none', "&:hover": { textDecoration: 'none' } }}
      >
        <Typography level="title-lg" sx={{ mb: 1 }}>
          {title}
        </Typography>
      </JoyLink>
      <Typography level="body-md">
        {description}
      </Typography>
    </Card>
  );
}

export default Account;
