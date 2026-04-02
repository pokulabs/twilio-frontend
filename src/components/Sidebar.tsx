import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
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
  YouTube,
  ShareRounded,
  AccountCircle,
  LogoutRounded,
  DescriptionRounded,
  SportsMartialArtsRounded,
  Email,
  LocalPoliceRounded,
  LocalPhoneRounded,
  HistoryRounded,
} from "@mui/icons-material";

import logo from "../assets/logo.png";
import slack from "../assets/slack.png";
import { closeSidebar, DOCS_LINK, YOUTUBE_LINK, SLACK_LINK } from "../utils";
import { useAuth } from "../hooks/use-auth";

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated, userEmail, signOut, isAdmin } = useAuth();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <Box
      sx={{
        width: { xs: 0, md: "var(--Sidebar-width)" },
        flexShrink: { md: 0 },
      }}
    >
      <Box
        className="Sidebar-overlay"
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          zIndex: 9998,
          inset: 0,
          opacity: "var(--SideNavigation-slideIn, 0)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: "translateX(calc((var(--SideNavigation-slideIn, 0) - 1) * 100%))",
        }}
        onClick={() => closeSidebar()}
      />
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
          left: 0,
          p: 2,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", cursor: "pointer", textDecoration: "none" }}
          component={Link}
          to="/"
        >
          <Avatar src={logo} size="sm" />
          <Typography level="title-lg">Poku</Typography>
        </Box>
        <Box
          sx={{
            minHeight: 0,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
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
                <AccountCircle />
                <ListItemContent>
                  <Typography level="title-sm">Account</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component={Link}
                to="/channels"
                selected={location.pathname === "/channels"}
              >
                <SportsMartialArtsRounded />
                <ListItemContent>
                  <Typography level="title-sm">Channels</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component={Link}
                to="/phones"
                selected={location.pathname === "/phones"}
              >
                <LocalPhoneRounded />
                <ListItemContent>
                  <Typography level="title-sm">Phones</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component={Link}
                to="/history"
                selected={location.pathname === "/history"}
              >
                <HistoryRounded />
                <ListItemContent>
                  <Typography level="title-sm">History</Typography>
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
            {isAdmin && (
              <ListItem>
                <ListItemButton
                  component={Link}
                  to="/admin"
                  selected={location.pathname === "/admin"}
                >
                  <LocalPoliceRounded />
                  <ListItemContent>
                    <Typography level="title-sm">Admin</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            )}
          </List>

          <List
            size="sm"
            sx={{
              mt: "auto",
              flexGrow: 0,
              mb: 1,
              gap: 2,
              "--ListItem-radius": (theme) => theme.vars.radius.sm,
            }}
            orientation="horizontal"
          >
            <ListItem>
              <ListItemButton
                component="a"
                href={DOCS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                title="Docs"
              >
                <DescriptionRounded />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component="a"
                href={SLACK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                title="Slack"
              >
                <Avatar size="sm" src={slack} sx={{ width: 18, height: 18 }} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component="a"
                href={YOUTUBE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
              >
                <YouTube />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component="a"
                href="mailto:hello@pokulabs.com"
                title="hello@pokulabs.com"
              >
                <Email />
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
                <Typography level="body-xs">{userEmail}</Typography>
              </Box>
              <IconButton
                title="Logout"
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => {
                  signOut();
                }}
              >
                <LogoutRounded />
              </IconButton>
            </Box>
          </>
        )}
      </Sheet>
    </Box>
  );
}
