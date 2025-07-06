import { useEffect } from "react";
import { useTwilio } from "../context/TwilioProvider";
import { useAuth, useAutoSignin } from "react-oidc-context";
import { apiClient } from "../api-client";

const Pages: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCredentials, sid, authToken } = useTwilio();

  useAutoSignin();

  const auth = useAuth();

  // useEffect(() => {
  //   return auth.events.addUserSignedIn(async () => {
  //     alert('hi')
  //     try {
  //       if (sid && authToken) {
  //         await apiClient.createTwilioKey(sid, authToken);
  //       }
  //     } catch (err) {
  //       console.error("Login failed:", err);
  //     }
  //   });
  // }, [auth.events]);

  useEffect(() => {
    if (sid && authToken) {
      setCredentials(sid, authToken).catch((err) =>
        console.error("Pages couldn't set credentials", err),
      );
    }
  }, []);

  return <>{children}</>;
};

export default Pages;
