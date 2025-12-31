import { Box, Radio, RadioGroup, radioClasses } from "@mui/joy";
import { ConfigureIcState } from "./HumanAsATool";
import slack from "../../assets/slack-color.png";
import whatsapp from "../../assets/whatsapp.png";
import sms from "../../assets/sms.png";
import call from "../../assets/call.png";
import dashboard from "../../assets/logo.png";

export function MediumSelector({
  uiChannel,
  setUiChannel,
}: {
  uiChannel: ConfigureIcState["uiChannel"];
  setUiChannel: (m: ConfigureIcState["uiChannel"]) => void;
}) {
  const icons: Record<string, string> = {
    sms,
    whatsapp,
    slack,
    call,
    dashboard,
  };

  return (
    <RadioGroup
      orientation="horizontal"
      aria-label="Alignment"
      name="alignment"
      variant="outlined"
      value={uiChannel}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setUiChannel(event.target.value as ConfigureIcState["uiChannel"])
      }
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      {["sms", "whatsapp", "slack", "call", "dashboard"].map((item) => (
        <Box
          key={item}
          sx={(theme) => ({
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            height: 35,
            "&:not([data-first-child])": {
              borderLeft: "1px solid",
              borderColor: "divider",
            },
            [`&[data-first-child] .${radioClasses.action}`]: {
              borderTopLeftRadius: `calc(${theme.vars.radius.sm} - 1px)`,
              borderBottomLeftRadius: `calc(${theme.vars.radius.sm} - 1px)`,
            },
            [`&[data-last-child] .${radioClasses.action}`]: {
              borderTopRightRadius: `calc(${theme.vars.radius.sm} - 1px)`,
              borderBottomRightRadius: `calc(${theme.vars.radius.sm} - 1px)`,
            },
          })}
        >
          <Radio
            value={item}
            disableIcon
            overlay
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  component="img"
                  src={icons[item]}
                  sx={{ width: 18, height: 18 }}
                />
                <span>
                  {
                    {
                      slack: "Slack",
                      whatsapp: "WhatsApp",
                      sms: "SMS",
                      call: "Call",
                      dashboard: "Dashboard",
                    }[item as ConfigureIcState["uiChannel"]]
                  }
                </span>
              </Box>
            }
            variant={
              uiChannel === (item as ConfigureIcState["uiChannel"])
                ? "solid"
                : "plain"
            }
            slotProps={{
              input: { "aria-label": item },
              action: {
                sx: { borderRadius: 0, transition: "none" },
              },
              label: { sx: { lineHeight: 0 } },
            }}
          />
        </Box>
      ))}
    </RadioGroup>
  );
}
