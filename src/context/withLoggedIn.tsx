import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

const withLoggedIn = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${currentPath}`);
      }
    }, [isAuthenticated, isLoading, location, navigate]);

    if (!isAuthenticated) return null;

    return <Component {...props} />;
  };
};

export default withLoggedIn;