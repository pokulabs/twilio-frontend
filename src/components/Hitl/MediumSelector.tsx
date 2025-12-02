import { ToggleButton, ToggleButtonGroup, Box} from "@mui/material";
import { ConfigureIcState } from "./HumanAsATool";
import slack from "../../assets/slack-color.png";
import whatsapp from "../../assets/whatsapp.png";
import sms from "../../assets/sms.png";
import call from "../../assets/call.png";

export function MediumSelector({
  uiChannel,
  setUiChannel,
}: {
  uiChannel: ConfigureIcState["uiChannel"];
  setUiChannel: (m: ConfigureIcState["uiChannel"]) => void;
}) {
  const uiChannelLabels: Record<ConfigureIcState["uiChannel"], string> = {
    sms: "SMS",
    whatsapp: "WhatsApp",
    slack: "Slack",
    call: "Call",
  }

  const uiChannelImages: Record<ConfigureIcState["uiChannel"], string> = {
    sms,
    whatsapp,
    slack,
    call,
  };

  const channels: ConfigureIcState["uiChannel"][] = ["sms", "whatsapp", "slack", "call"]

  return (
    <ToggleButtonGroup
      exclusive
      orientation="horizontal"
      aria-label="Alignment"
      value={uiChannel}
      onChange={(_event, value: ConfigureIcState["uiChannel"] | null) => {
        if(value !== null) setUiChannel(value)
      }}
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      {channels.map((channel, index) => (
        <Box
          key={channel}
          data-first-child={index === 0 ? "" : undefined}
          data-last-child={index === channels.length - 1 ? "" : undefined}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            height: 35,
            "&:not([data-first-child])": {

              borderColor: "divider",
            },
          }}
        >
          <ToggleButton
            value={channel}
            aria-label={uiChannelLabels[channel]}
            sx={{
              width: "100%",
              height: "100%",
              p: 2,
              borderRadius: 2,
              fontSize: 15,
              textTransform: "none",
              color: "text.primary",

              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "common.white",
                "&:hover": {
                  bgcolor: "primary.dark"
                }
              },
            }}
          >
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Box
                component="img"
                src={uiChannelImages[channel]}
                alt={uiChannelLabels[channel]}
                sx={{ width: 18, height: 18 }}
              />
              {uiChannelLabels[channel]}
            </Box>
          </ToggleButton>
        </Box>
      ))}
    </ToggleButtonGroup>
  );
}
