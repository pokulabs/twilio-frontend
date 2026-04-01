import { Box, Typography, Card, Stack, Divider } from "@mui/joy";
import ApiKey from "./ApiKey";
import { Link } from "react-router-dom";
import { CreditsRemaining } from "../shared/Usage";
import { YOUTUBE_LINK } from "../../utils";

function Account() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        margin: "0 auto", // Center the container
        gap: 4,
      }}
    >
      <Box>
         {/* My Keys & Credits Section */}
        <Card variant="outlined" sx={{ p: 3, backgroundColor: "white" }}>
          <Typography level="title-lg" sx={{ mb: 3 }}>
            My Credits & API Key
          </Typography>

          <Stack spacing={3}>
            <CreditsRemaining />
            <Divider />
            <ApiKey />
          </Stack>
        </Card>
      </Box>

      <Box>
        <Typography level="title-lg" sx={{ mb: 2 }}>
          Need Help?
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <ActionCard
            href="https://calendly.com/getpoku/30min"
            sx={{ p: 3 }}
          >
            <Typography level="title-md" sx={{ mb: 1 }}>
              Schedule a Call
            </Typography>
            <Typography level="body-sm">
              Book a one-on-one session
            </Typography>
          </ActionCard>
          
          <ActionCard
            href="mailto:hello@pokulabs.com"
            sx={{ p: 3 }}
          >
            <Typography level="title-md" sx={{ mb: 1 }}>
              Contact Support
            </Typography>
            <Typography level="body-sm">
              Email hello@pokulabs.com with questions or feedback
            </Typography>
          </ActionCard>

          <ActionCard
            href={YOUTUBE_LINK}
            sx={{ p: 3 }}
          >
            <Typography level="title-md" sx={{ mb: 1 }}>
              Tutorial Videos
            </Typography>
            <Typography level="body-sm">
              Watch our Youtube Videos for demos & walkthroughs
            </Typography>
          </ActionCard>
        </Stack>
      </Box>
    </Box>
  );
}

function ActionCard({ 
  children,
  href, 
  to,
  sx
}: { 
  children: React.ReactNode; 
  href?: string; 
  to?: string;
  sx?: any;
}) {
  const isExternal = !!href;
  
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        transition: "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
        "&:hover": {
          boxShadow: "sm",
          borderColor: "neutral.outlinedHoverBorder",
          backgroundColor: "#fafafa",
        },
        backgroundColor: "white",
        cursor: "pointer",
        textDecoration: "none",
        ...sx,
      }}
      component={to ? Link : (isExternal ? 'a' : 'div')}
      {...(to ? { to } : {})}
      {...(isExternal ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Card>
  );
}

export default Account;
