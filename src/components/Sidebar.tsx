import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  GlobalStyles,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  listItemButtonClasses,
  ListItemContent,
  Typography,
  Sheet,
  Divider,
  IconButton,
} from "@mui/joy";
import {
  QuestionAnswerRounded,
  GitHub,
  ShareRounded,
  AccountCircle,
  LogoutRounded,
  DescriptionRounded,
  SportsMartialArtsRounded,
} from "@mui/icons-material";

import logo from "../assets/logo.png"; // Import the logo
import slack from "../assets/slack.png";
import ColorSchemeToggle from "./Messages/ColorSchemeToggle";
import { closeSidebar, DOCS_LINK, GITHUB_LINK, SLACK_LINK } from "../utils";
import { useAuth } from "../context/AuthContext";
import { googleLogout } from "@react-oauth/google";

export default function Sidebar() {
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 9999,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Avatar src={logo} size="sm" />
        <Typography level="title-lg">Poku</Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem>
            <ListItemButton
              component={Link}
              to="/"
              selected={location.pathname === "/"}
            >
              <QuestionAnswerRounded />
              <ListItemContent>
                <Typography level="title-sm">Messages</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={Link}
              to="/integrations"
              selected={location.pathname === "/integrations"}
            >
              <ShareRounded />
              <ListItemContent>
                <Typography level="title-sm">Integrations</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={Link}
              to="/hitl"
              selected={location.pathname === "/hitl"}
            >
              <SportsMartialArtsRounded />
              <ListItemContent>
                <Typography level="title-sm">Human Intervention</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={Link}
              to="/account"
              selected={location.pathname === "/account"}
            >
              <AccountCircle />
              <ListItemContent>
                <Typography level="title-sm">Account</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>

        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            mb: 2,
            gap: 1,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem>
            <ListItemButton
              component="a"
              href={DOCS_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DescriptionRounded />
              <ListItemContent>
                <Typography level="title-sm">Documentation</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component="a"
              href={SLACK_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Avatar size="sm" src={slack} sx={{ width: 18, height: 18 }} />
              <ListItemContent>
                <Typography level="title-sm">Slack</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component="a"
              href={GITHUB_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub />
              <ListItemContent>
                <Typography level="title-sm">GitHub</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      {isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography level="title-sm">Logged in</Typography>
              <Typography level="body-xs">{user?.email}</Typography>
            </Box>
            <IconButton
              title="Logout"
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => {
                googleLogout();
                logout();
              }}
            >
              <LogoutRounded />
            </IconButton>
          </Box>
        </>
      )}
    </Sheet>
  );
}
