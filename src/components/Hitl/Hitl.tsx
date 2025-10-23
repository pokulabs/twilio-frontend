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

import HumanAsATool from "./HumanAsATool";
import TryIt from "./TryIt";
import Steps from "./Steps";

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
              Try it
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={1}>
              Configure
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={2}>
              Instructions
            </Tab>
          </TabList>
          <Box sx={{ p: 2 }}>
            <Typography level="body-sm">
              Enable your AI agent to loop in a human for help. Works with any
              agent that can use MCP.
            </Typography>
            <Typography level="body-sm">
              Learn more{" "}
              <Link
                href="https://www.pokulabs.com/guides/poku-human-in-the-loop-tools"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              .
            </Typography>
            <TabPanel value={0} sx={{ p: 0 }}>
              <TryIt />
            </TabPanel>
            <TabPanel value={1} sx={{ p: 0 }}>
              <HumanAsATool />
            </TabPanel>
            <TabPanel value={2} sx={{ p: 0 }}>
              <Steps />
            </TabPanel>
          </Box>
        </Tabs>
      </Box>
    </Box>
  );
}

export default Hitl;
