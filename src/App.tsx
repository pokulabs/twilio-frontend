import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import { CssBaseline, Box } from "@mui/joy";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Sidebar from "./components/Sidebar";
import Header from "./components/Messages/Header";
import Messages from "./components/Messages/Messages";
import Integrations from "./components/Integrations/Integrations";
import Pages from "./components/Pages";
import Account from "./components/Account/Account";
import { CredentialsProvider } from "./context/CredentialsContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CredentialsProvider>
          <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Router>
              <Pages>
                <Box
                  sx={{
                    display: "flex",
                    minHeight: "100dvh",
                    overflow: "hidden",
                  }}
                >
                  <Sidebar />
                  <Header />
                  <Routes>
                    <Route path="/" element={<Messages />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/account" element={<Account />} />
                  </Routes>
                </Box>
              </Pages>
            </Router>
          </CssVarsProvider>
        </CredentialsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
