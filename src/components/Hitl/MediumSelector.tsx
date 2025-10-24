import { Box, Radio, RadioGroup, radioClasses } from "@mui/joy";
import { ConfigureIcState } from "./HumanAsATool";

export function MediumSelector({
  uiChannel,
  setUiChannel,
}: {
  uiChannel: ConfigureIcState["uiChannel"];
  setUiChannel: (m: ConfigureIcState["uiChannel"]) => void;
}) {
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
      {["sms", "whatsapp", "slack", "call"].map((item) => (
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
              {
                slack: "Slack",
                whatsapp: "WhatsApp",
                sms: "SMS",
                call: "Call",
              }[item as ConfigureIcState["uiChannel"]]
            }
            variant={uiChannel === (item as ConfigureIcState["uiChannel"]) ? "solid" : "plain"}
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
