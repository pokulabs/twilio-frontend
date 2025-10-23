import { Box, Input, Link, Typography } from "@mui/joy";
import { InfoTooltip } from "../shared/InfoTooltip";
import { SLACK_LINK } from "../../utils";

export function SlackInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <>
      <Typography level="body-sm">
        Join our <Link href={SLACK_LINK}>Slack channel</Link> and reply in a
        thread to your agent.
      </Typography>
      <Box>
        <Typography
          level="title-md"
          endDecorator={
            <InfoTooltip
              title={
                <Typography>
                  This is the human your AI will reach out to in case of an
                  interaction. In Slack, go to your user profile. Then click the
                  3 vertical dots button. Select "Copy Member ID" and paste it
                  here.
                </Typography>
              }
            />
          }
        >
          Slack User ID
        </Typography>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value || "")}
          placeholder="Ex: U08LGBTCBNH"
        />
      </Box>
    </>
  );
}
