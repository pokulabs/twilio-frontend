import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { drawerClasses } from "@mui/material/Drawer";
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
import { DOCS_LINK, YOUTUBE_LINK, SLACK_LINK } from "../utils";
import { useAuth } from "../hooks/use-auth";

const drawerWidth = 240;

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated, userEmail, signOut, isAdmin } = useAuth();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname, onMobileClose]);

  const navItems = [
    { label: "Account", to: "/", icon: <AccountCircle /> },
    {
      label: "Channels",
      to: "/channels",
      icon: <SportsMartialArtsRounded />,
    },
    { label: "Phones", to: "/phones", icon: <LocalPhoneRounded /> },
    { label: "History", to: "/history", icon: <HistoryRounded /> },
    {
      label: "Integrations",
      to: "/integrations",
      icon: <ShareRounded />,
    },
    ...(isAdmin
      ? [{ label: "Admin", to: "/admin", icon: <LocalPoliceRounded /> }]
      : []),
  ];

  const footerLinks = [
    {
      title: "Docs",
      href: DOCS_LINK,
      icon: <DescriptionRounded />,
    },
    {
      title: "Slack",
      href: SLACK_LINK,
      icon: <Avatar src={slack} sx={{ width: 18, height: 18 }} />,
    },
    {
      title: "YouTube",
      href: YOUTUBE_LINK,
      icon: <YouTube />,
    },
    {
      title: "hello@pokulabs.com",
      href: "mailto:hello@pokulabs.com",
      icon: <Email />,
    },
  ];

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          textDecoration: "none",
          color: "inherit",
        }}
        component={Link}
        to="/"
      >
        <Avatar src={logo} sx={{ width: 32, height: 32 }} />
        <Typography variant="h6">Poku</Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          overflow: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          px: 1.5,
          py: 2,
        }}
      >
        <List dense disablePadding>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{ borderRadius: 1.5 }}
                onClick={onMobileClose}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={1} sx={{ mt: "auto", px: 0.5, pb: 1 }}>
          {footerLinks.map((item) => (
            <IconButton
              key={item.title}
              component="a"
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              title={item.title}
              color="default"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Stack>
      </Box>

      {isAuthenticated && (
        <>
          <Divider />
          <Stack
            direction="row"
            sx={{
              p: 2,
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box sx={{ minWidth: 0, mr: "auto" }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                Logged in
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {userEmail}
              </Typography>
            </Box>
            <IconButton
              title="Logout"
              size="small"
              color="default"
              onClick={() => {
                signOut();
              }}
            >
              <LogoutRounded />
            </IconButton>
          </Stack>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        width: { xs: 0, md: drawerWidth },
        flexShrink: { md: 0 },
      }}
    >
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        variant="temporary"
        sx={{
          display: { xs: "block", md: "none" },
          [`& .${drawerClasses.paper}`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        open
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          [`& .${drawerClasses.paper}`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
}
