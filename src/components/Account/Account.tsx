import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ApiKey from "./ApiKey";
import { CreditsRemaining } from "../shared/Usage";
import { DOCS_LINK, YOUTUBE_LINK } from "../../utils";

function Account() {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          margin: "0 auto",
          gap: 4,
        }}
      >
        <Box>
          <Card variant="outlined" sx={{ backgroundColor: "background.paper" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                My Credits & API Key
              </Typography>

              <Stack spacing={3}>
                <CreditsRemaining />
                <Divider />
                <ApiKey />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          
          <Card
            sx={{
              color: "#fff",
              background:
                "linear-gradient(135deg,rgb(90, 152, 213) 0%,rgb(58, 112, 167) 55%,rgb(55, 90, 172) 100%)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2} alignItems="flex-start">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  New to Poku? Start with the docs.
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 720, color: "inherit" }}>
                  We're an API-first product. The docs are where the juicy bits are.
                </Typography>
                <Button
                  component="a"
                  href={DOCS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="inherit"
                  endIcon={<ArrowForwardRounded />}
                  size="large"
                  sx={{
                    color: "primary.main",
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                    },
                  }}
                >
                  Open Docs
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Get Help
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <ActionCard href="https://calendly.com/getpoku/30min">
              <Typography variant="h6" sx={{ mb: 1 }}>
                Schedule a Call
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book a one-on-one session
              </Typography>
            </ActionCard>

            <ActionCard href="mailto:hello@pokulabs.com">
              <Typography variant="h6" sx={{ mb: 1 }}>
                Contact Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email hello@pokulabs.com with questions or feedback
              </Typography>
            </ActionCard>

            <ActionCard href={YOUTUBE_LINK}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tutorial Videos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Watch our YouTube videos for demos and walkthroughs
              </Typography>
            </ActionCard>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function ActionCard({
  children,
  href,
  sx,
}: {
  children: React.ReactNode;
  href: string;
  sx?: SxProps<Theme>;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        backgroundColor: "background.paper",
        transition: "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: 1,
          backgroundColor: "#fafafa",
        },
        ...sx,
      }}
    >
      <CardActionArea
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ height: "100%" }}
      >
        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Account;
