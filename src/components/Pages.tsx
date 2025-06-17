import { useEffect } from "react";
import { useTwilio } from "../context/TwilioProvider";

const Pages: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCredentials, sid, authToken } = useTwilio();

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
