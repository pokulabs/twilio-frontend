import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Input,
  Button,
  Divider,
  FormControl,
  FormLabel,
  SvgIcon,
  Avatar,
  Stack,
  Sheet,
  CircularProgress,
  Alert,
} from "@mui/joy";
import logo from "../assets/logo.png";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const { isAuthenticated, isLoading, signInMagicLink, signInGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirect =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const handleEmailLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      setErrorText(null);
      await signInMagicLink(trimmedEmail, redirect);
      setMagicLinkSent(true);
    } catch (err) {
      console.error("Failed to send magic link", err);
      setErrorText("Could not send the sign-in email. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <Sheet
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        background:
          "radial-gradient(circle at top, var(--joy-palette-primary-softBg), transparent 55%)",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          boxShadow: "lg",
        }}
      >
        {magicLinkSent ? (
          <Stack spacing={2} sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "primary.softBg",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              <Avatar src={logo} size="sm" />
            </Box>
            <Typography level="h3">Check your email</Typography>
            <Typography level="body-sm" textColor="text.secondary">
              We sent a magic link to <strong>{email.trim()}</strong>.
            </Typography>
            <Typography level="body-sm" textColor="text.tertiary">
              Open the link to finish signing in to your dashboard.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "neutral.softBg",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <Avatar src={logo} size="sm" />
              </Box>
              <Typography level="h3">Sign in to Poku</Typography>
              <Typography level="body-sm" textColor="text.secondary">
                Continue with email or Google to open your dashboard.
              </Typography>
            </Box>

            {errorText ? (
              <Alert color="danger" variant="soft">
                {errorText}
              </Alert>
            ) : null}

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleEmailLogin();
                  }
                }}
              />
            </FormControl>

            <Button variant="solid" size="lg" onClick={() => void handleEmailLogin()}>
              Continue with Email
            </Button>

            <Divider>or</Divider>

            <Button
              variant="soft"
              color="neutral"
              size="lg"
              startDecorator={<GoogleIcon />}
              onClick={() => {
                void signInGoogle(redirect);
              }}
            >
              Continue with Google
            </Button>
          </Stack>
        )}
      </Card>
    </Sheet>
  );
}

function GoogleIcon() {
  return (
    <SvgIcon fontSize="xl">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path
          fill="#4285F4"
          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
        />
        <path
          fill="#34A853"
          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
        />
        <path
          fill="#FBBC05"
          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
        />
        <path
          fill="#EA4335"
          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
        />
      </g>
    </SvgIcon>
  );
}
