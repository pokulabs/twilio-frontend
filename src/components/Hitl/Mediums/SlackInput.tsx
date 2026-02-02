import { useState } from "react";
import { Box, Checkbox, Input, Link, Stack, Typography } from "@mui/joy";
import { InfoTooltip } from "../../shared/InfoTooltip";
import { SLACK_LINK } from "../../../utils";
import { AdvancedOptions } from "../AdvancedOptions";
import { WaitTimeInput } from "./WaitTimeInput";
import { apiClient } from "../../../api-client";
import CreateButton from "../../shared/CreateButton";

export function SlackInput({ onSaved }: { onSaved?: () => void }) {
  const [usingOwnSlack, setUsingOwnSlack] = useState(false);
  const [agentNumber, setAgentNumber] = useState("");
  const [humanNumber, setHumanNumber] = useState("");
  const [waitTime, setWaitTime] = useState(60);

  // Advanced options state
  const [webhook, setWebhook] = useState<string | undefined>();
  const [validTimeSeconds, setValidTimeSeconds] = useState<number | undefined>();
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState<string | undefined>();
  const [responseTemplate, setResponseTemplate] = useState<string | undefined>();
  const [noResponseTemplate, setNoResponseTemplate] = useState<string | undefined>();

  const isValid = (() => {
    if (!humanNumber) return false;
    if (usingOwnSlack && !agentNumber) return false;
    return true;
  })();

  const handleSave = async () => {
    await apiClient.createInteractionChannel({
      humanNumber,
      medium: usingOwnSlack ? "slack" : "slack_poku",
      agentNumber: usingOwnSlack ? agentNumber : undefined,
      waitTime,
      webhook,
      validTime: validTimeSeconds,
      linkEnabled,
      messageTemplate,
      responseTemplate,
      noResponseTemplate,
    });
    onSaved?.();
  };

  return (
    <>
      <Box>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          Receive a Slack message from your agent and <b>reply in the thread.</b>
        </Typography>

        <Checkbox
          label="Use my own Slack workspace"
          checked={usingOwnSlack}
          onChange={(e) => setUsingOwnSlack(e.target.checked)}
        />
        {!usingOwnSlack && (
          <Typography level="body-sm">
            Join our <Link href={SLACK_LINK}>Slack workspace</Link> if you don't want to use your own.
          </Typography>
        )}
        {usingOwnSlack && (
          <>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              If you haven't yet, install the Slack app in your workspace.
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
            <Box sx={{ mt: 1 }}>
              <Typography
                level="title-md"
                endDecorator={
                  <InfoTooltip
                    title={
                      <Typography>
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
                }
              >
                Slack Workspace/Team ID
              </Typography>
              <Input
                value={agentNumber}
                onChange={(e) => setAgentNumber(e.target.value || "")}
                placeholder="Ex: T0123456789"
              />
            </Box>
          </>
        )}
      </Box>
      <Box>
        <Typography
          level="title-md"
          endDecorator={
            <InfoTooltip
              title={
                <Typography>
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
          }
        >
          Slack User/Member/Channel ID
        </Typography>

        <Input
          value={humanNumber}
          onChange={(e) => setHumanNumber(e.target.value || "")}
          placeholder="Ex: U08LGBTCBNH"
        />
      </Box>

      <WaitTimeInput value={waitTime} onChange={setWaitTime} />

      <AdvancedOptions
        webhook={webhook}
        setWebhook={setWebhook}
        validTimeSeconds={validTimeSeconds}
        setValidTimeSeconds={setValidTimeSeconds}
        linkEnabled={linkEnabled}
        setLinkEnabled={setLinkEnabled}
        messageTemplate={messageTemplate}
        setMessageTemplate={setMessageTemplate}
        responseTemplate={responseTemplate}
        setResponseTemplate={setResponseTemplate}
        noResponseTemplate={noResponseTemplate}
        setNoResponseTemplate={setNoResponseTemplate}
        uiChannel="slack"
      />

      <Stack gap={1}>
        <CreateButton onCreate={handleSave} disabled={!isValid}>
          Create
        </CreateButton>
      </Stack>
    </>
  );
}
