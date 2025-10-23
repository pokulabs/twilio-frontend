import { Box, Radio, RadioGroup, radioClasses } from "@mui/joy";
import type { UiChannel } from "./helpers";

export function MediumSelector({
  uiChannel,
  setUiChannel,
}: {
  uiChannel: UiChannel;
  setUiChannel: (m: UiChannel) => void;
}) {
  return (
    <RadioGroup
      orientation="horizontal"
      aria-label="Alignment"
      name="alignment"
      variant="outlined"
      value={uiChannel}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setUiChannel(event.target.value as UiChannel)
      }
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      {["sms", "whatsapp", "slack"].map((item) => (
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
              }[item as UiChannel]
            }
            variant={uiChannel === (item as UiChannel) ? "solid" : "plain"}
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


