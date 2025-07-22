import { useEffect, useState } from "react";
import { useTwilio } from "../context/TwilioProvider";
import { apiClient } from "../api-client";

const Pages: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCredentials, sid, authToken } = useTwilio();

  // const [hasTriedSignin, setHasTriedSignin] = useState(false);

  // automatically sign-in
  // useEffect(() => {
  //   if (
  //     !hasAuthParams() &&
  //     !auth.isAuthenticated &&
  //     !auth.activeNavigator &&
  //     !auth.isLoading &&
  //     !hasTriedSignin
  //   ) {
  //     auth.signinSilent();
  //     setHasTriedSignin(true);
  //   }
  // }, [auth, hasTriedSignin]);

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
