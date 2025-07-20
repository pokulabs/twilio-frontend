import { Button } from "@mui/joy";
import { authClient } from "../context/Auth";

export default function LoginButton(props: {
  path?: string;
  variant?: "solid" | "outlined";
  text?: string;
}) {
  const { data } = authClient.useSession();

  return (
    <Button
      disabled={!!data}
      variant={props.variant ?? "solid"}
      onClick={() => {
        authClient.signIn.social({
          provider: "google",
          callbackURL: import.meta.env.VITE_UI_URL
        })
        // signinRedirect({
        //   redirect_uri: `${window.location.origin}${props.path ?? window.location.pathname}`,
        // });
      }}
    >
      {props.text ?? (data ? "Logged In" : "Login")}
    </Button>
  );
}
