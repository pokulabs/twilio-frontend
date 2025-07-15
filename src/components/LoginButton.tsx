import { Button } from "@mui/joy";
import { useAuth } from "react-oidc-context";

export default function LoginButton(props: {
  path?: string;
  variant?: "solid" | "outlined";
  text?: string;
}) {
  const { isAuthenticated, signinRedirect } = useAuth();

  return (
    <Button
      disabled={isAuthenticated}
      variant={props.variant ?? "solid"}
      onClick={() => {
        signinRedirect({
          redirect_uri: `${window.location.origin}${props.path ?? window.location.pathname}`,
        });
      }}
    >
      {props.text ?? (isAuthenticated ? "Logged In" : "Login")}
    </Button>
  );
}
