import { Box, Tab, tabClasses, TabList, TabPanel, Tabs } from "@mui/joy";
import { TwilioIntegrationForm } from "./TwilioForm";
import Vapi from "./Vapi";
import Retell from "./Retell";

export default function Integrations() {
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
              Twilio
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={1}>
              Vapi
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={2}>
              Retell
            </Tab>
          </TabList>
          <Box sx={{ p: 2 }}>
            <TabPanel value={0} sx={{ p: 0, maxWidth: 500 }}>
              <TwilioIntegrationForm />
            </TabPanel>
            <TabPanel value={1} sx={{ p: 0, maxWidth: 500 }}>
              <Vapi />
            </TabPanel>
            <TabPanel value={2} sx={{ p: 0, maxWidth: 500 }}>
              <Retell />
            </TabPanel>
          </Box>
        </Tabs>
      </Box>
    </Box>
  );
}
