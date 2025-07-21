import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import { CssBaseline, Box } from "@mui/joy";

import Sidebar from "./components/Sidebar";
import Header from "./components/Messages/Header";
import Messages from "./components/Messages/Messages";
import Integrations from "./components/Integrations/Integrations";
import Pages from "./components/Pages";
import Account from "./components/Account/Account";
import Hitl from "./components/Hitl/Hitl";
import { TwilioProvider } from "./context/TwilioProvider";
import { WebsocketProvider } from "./context/WebsocketProvider";
import Campaigns from "./components/Campaigns/Campaigns";
import { WebStorageStateStore } from "oidc-client-ts";
import Login from "./components/Login";

export default function App() {
  return (
    // <KCAuthProvider
    //   {...{
    //     authority: import.meta.env.VITE_AUTHORITY_URL,
    //     client_id: import.meta.env.VITE_CLIENT_ID,
    //     redirect_uri: `${window.location.origin}${window.location.pathname}`,
    //     post_logout_redirect_uri: window.location.origin,
    //     monitorSession: true,
    //     onSigninCallback: () => {
    //       window.history.replaceState(
    //         {},
    //         document.title,
    //         window.location.pathname,
    //       );
    //     },
    //     scope: "openid profile email",
    //     userStore: new WebStorageStateStore({ store: window.localStorage }),
    //   }}
    // >
      <TwilioProvider>
        <WebsocketProvider>
          <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Router>
              <Pages>
                <Box
                  sx={{
                    display: "flex",
                  }}
                >
                  <Sidebar />
                  <Header />
                  <Routes>
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/" element={<Account />} />
                    <Route path="/hitl" element={<Hitl />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </Box>
              </Pages>
            </Router>
          </CssVarsProvider>
        </WebsocketProvider>
      </TwilioProvider>
    // </KCAuthProvider>
  );
}
