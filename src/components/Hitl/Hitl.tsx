import {
  Box,
  Link,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";

import withLoggedIn from "../../context/withLoggedIn";
import HumanAsATool from "./HumanAsATool";
import Flagging from "./Flagging";

function Hitl() {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: { sm: -100, md: -110 },
          bgcolor: "background.body",
          pt: 10,
        }}
      >
        <Tabs defaultValue={0} sx={{ bgcolor: "transparent" }}>
          <TabList
            tabFlex={1}
            size="sm"
            sx={{
              pl: { xs: 0, md: 4 },
              justifyContent: "left",
              [`&& .${tabClasses.root}`]: {
                fontWeight: "600",
                flex: "initial",
                color: "text.tertiary",
                [`&.${tabClasses.selected}`]: {
                  bgcolor: "transparent",
                  color: "text.primary",
                  "&::after": {
                    height: "2px",
                    bgcolor: "primary.500",
                  },
                },
              },
            }}
          >
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={0}>
              Human in the Loop
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={1}>
              Flagging
            </Tab>
          </TabList>
          <TabPanel value={0}>
            <Box
              sx={{
                display: "flex",
                marginTop: 5,
                flexDirection: "column",
                p: 2,
                width: "100%",
                maxWidth: 500,
              }}
            >
              <HumanAsATool />
            </Box>
          </TabPanel>
          <TabPanel value={1}>
            <Box
              sx={{
                display: "flex",
                marginTop: 5,
                flexDirection: "column",
                p: 2,
                width: "100%",
                maxWidth: 500,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography>
                    Automatically flag messages for review based on your own
                    rules, using your own OpenAI Key.
                  </Typography>
                  <Typography>
                    Learn more{" "}
                    <Link
                      href="https://www.pokulabs.com/guides/conversation-flagging"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </Link>
                    .
                  </Typography>
                </Box>
                <Flagging />
              </Box>
            </Box>
          </TabPanel>
        </Tabs>
      </Box>
    </Box>
  );
}

export default withLoggedIn(Hitl);
