import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import { CssBaseline, Box } from "@mui/joy";
import { useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Messages/Header";
import Messages from "./components/Messages/Messages";
import Integrations from "./components/Integrations/Integrations";
import Account from "./components/Account/Account";
import Hitl from "./components/Hitl/Hitl";
import { TwilioProvider } from "./context/TwilioProvider";
import { WebsocketProvider } from "./context/WebsocketProvider";
import Campaigns from "./components/Campaigns/Campaigns";
import Login from "./components/Login";
import Admin from "./components/Admin/Admin";
import Flagging from "./components/Flagging/Flagging";
import PublicReply from "./components/PublicReply/PublicReply";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import ApiDocs from "./components/ApiDocs/ApiDocs";
import { authClient } from "./services/auth";

function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Header />
      <Routes>
        <Route path="/messages" element={<Messages />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/flagging" element={<Flagging />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/" element={<Account />} />
        <Route path="/hitl" element={<Hitl />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reply/:token" element={<PublicReply />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/docs" element={<ApiDocs />} />
      </Routes>
    </Box>
  );
}

function MessagesOnlyLayout() {

  const { token, email } = useParams<{ token: string; email: string; }>();
  // Only trigger the magicLink once when the component mounts
  useEffect(() => {
    authClient.signIn.magicLink({
      email: email ?? "",
      callbackURL: import.meta.env.VITE_UI_URL + "/embed/" + token,
    });
  }, []);
  return (
    <Box sx={{ display: "flex" }}>
      <Messages />
    </Box>
  );
}

export default function App() {
  return (
    <TwilioProvider>
      <WebsocketProvider>
        <CssVarsProvider disableTransitionOnChange>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/embed/:email/:token" element={<MessagesOnlyLayout />} />
              <Route path="*" element={<MainLayout />} />
            </Routes>
          </Router>
        </CssVarsProvider>
      </WebsocketProvider>
    </TwilioProvider>
  );
}
