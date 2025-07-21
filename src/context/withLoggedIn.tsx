import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authClient } from "./Auth";

const withLoggedIn = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return (props: P) => {
    const { data, isPending } = authClient.useSession();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isPending && !data) {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${currentPath}`);
      }
    }, [data, isPending, location, navigate]);

    if (!data) return null;

    return <Component {...props} />;
  };
};

export default withLoggedIn;