import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import {
  Box,
  CircularProgress,
  CssBaseline,
  IconButton,
  Typography,
} from "@mui/material";
import MenuRounded from "@mui/icons-material/MenuRounded";
import {
  ThemeProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";

import Sidebar from "./components/Sidebar";
import Integrations from "./components/Integrations/Integrations";
import Account from "./components/Account/Account";
import { TwilioProvider } from "./context/TwilioProvider";
import Login from "./components/Login";
import Admin from "./components/Admin/Admin";
import PublicReply from "./components/PublicReply/PublicReply";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import { useAuth } from "./hooks/use-auth";
import Phones from "./components/Phones";
import History from "./components/History";
import HumanAsATool from "./components/Hitl/HumanAsATool";
import { appTheme } from "./theme";
import { toggleSidebar } from "./utils";

function TabContentLayout() {
  return (
    <Box
      component="main"
      sx={{
        minWidth: 0,
        minHeight: "100dvh",
        px: { xs: 2, sm: 3, md: 10 },
        py: { xs: 2, sm: 3, md: 10 },
        display: "flex",
        justifyContent: "center",
        maxWidth: 1400,
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function MainLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <IconButton
            onClick={() => toggleSidebar()}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            <MenuRounded />
          </IconButton>
        </Box>
        <Routes>
          <Route element={<TabContentLayout />}>
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/" element={<Account />} />
            <Route path="/channels" element={<HumanAsATool />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/phones" element={<Phones />} />
            <Route path="/history" element={<History />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(
      location.pathname + location.search + location.hash,
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}


export default function App() {
  return (
    <TwilioProvider>
      <ThemeProvider theme={{ [MATERIAL_THEME_ID]: appTheme }}>
        <CssVarsProvider disableTransitionOnChange>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reply/:token" element={<PublicReply />} />
              <Route
                path="*"
                element={
                  <RequireAuth>
                    <MainLayout />
                  </RequireAuth>
                }
              />
            </Routes>
          </Router>
        </CssVarsProvider>
      </ThemeProvider>
    </TwilioProvider>
  );
}
