import { Box, Tab, TabList, Tabs, tabClasses, TabPanel } from "@mui/joy";
import Whatsapp from "./Whatsapp";
import Webhooks from "./Webhooks";
import TwilioForm from "./TwilioForm";

export default function WebhookIntegration() {
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
              Whatsapp
            </Tab>
            <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={2}>
              Webhooks
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
              <TwilioForm />
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
              <Whatsapp />
            </Box>
          </TabPanel>
          <TabPanel value={2}>
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
              <Webhooks />
            </Box>
          </TabPanel>
        </Tabs>
      </Box>
    </Box>
  );
}
