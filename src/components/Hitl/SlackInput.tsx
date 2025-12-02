import { Box, Link, Typography} from "@mui/material";
import { InfoTooltip } from "../shared/InfoTooltip";
import { SLACK_LINK } from "../../utils";
import { CreateTextField } from "../shared/CreateTextField";
import CreateCheckbox from "../shared/CreateCheckbox";


type SlackValues = {
  usingOwnSlack: boolean;
  agentNumber: string;
  humanNumber: string;
};

export function SlackInput({
  value,
  onChange,
}: {
  value: SlackValues;
  onChange: (next: SlackValues) => void;
}) {
  return (
    <>
      <Box>
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          Receive a Slack message from your agent and <b>reply in the thread.</b>
        </Typography>
        <CreateCheckbox 
          label="Use my own Slack workspace"
          checkboxProps={{
            checked: value.usingOwnSlack,
            onChange: (e) =>
              onChange({...value, usingOwnSlack: e.target.checked})
          }}
        />
        {!value.usingOwnSlack && (
          <Typography variant="body2" color="text.secondary">
            Join our <Link href={SLACK_LINK}>Slack channel</Link> and reply in a
            thread to your agent.
          </Typography>
        )}
        {value.usingOwnSlack && (
          <>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              First install the Slack app in your workspace.
            </Typography>
            <a
              target="_blank"
              href="https://slack.com/oauth/v2/authorize?client_id=8696401389877.9342964367269&scope=channels:history,channels:join,chat:write,chat:write.public,groups:history,im:history,im:write,mpim:write,users:read,mpim:history&user_scope="
            >
              <img
                alt="Add to Slack"
                height="40"
                width="139"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
              />
            </a>
            <Box sx={{ mt: 1}}>
              <Box sx={{display: "flex", alignItems: "center"}}>
                <Typography variant="subtitle1">
                  Slack Team ID
                </Typography>
                  <InfoTooltip
                    title={
                      <Typography variant="body2">
                        This is the ID of your Slack workspace. You can find it{" "}
                        <a
                          href="https://slack.com/help/articles/221769328-Locate-your-Slack-URL-or-ID#find-your-workspace-or-org-id"
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                          here
                        </a>
                        .
                      </Typography>
                    }
                    />
                </Box>
              <CreateTextField
                value={value.agentNumber}
                onChange={(e) =>
                  onChange({ ...value, agentNumber: e.target.value || "" })
                }
                placeholder="Ex: T0123456789"
              />
            </Box>
          </>
        )}
      </Box>
      <Box>
        <Box sx={{display: "flex", alignItems: "center", gap: 0.5, mb: 1}}>
          <Typography
            variant="subtitle1"
          >
            Slack User ID
          </Typography>
          <InfoTooltip
            title={
              <Typography variant="body2">
                 This is the Slack user or channel your AI will reach out to in case of an
                  interaction.
                  <br /><br />
                  User: go to your user profile, click the
                  3 vertical dots button, select "Copy Member ID" and paste it here.
                  <br /><br />
                  Channel: right click the channel, "View channel details" and copy the channel ID at the bottom of the page.
              </Typography>
            }
          />
        </Box>


        <CreateTextField
          onChange={(e) =>
            onChange({ ...value, humanNumber: e.target.value || "" })
          }
          placeholder="Ex: U08LGBTCBNH"
        />
      </Box>
    </>
  );
}
