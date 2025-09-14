import { useEffect, useRef, useState } from "react";
import {
  Button,
  Typography,
  Input,
  Stack,
  Select,
  Option,
  Box,
  Radio,
  RadioGroup,
  LinearProgress,
  Link,
  Checkbox,
  radioClasses,
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import { Link as RLink } from "react-router-dom";
import Steps from "./Steps";
import type { Medium } from "../../types";
import { InfoTooltip } from "../shared/InfoTooltip";
import { SLACK_LINK } from "../../utils";

type UiChannel = "slack" | "whatsapp" | "sms";

function mapUiChannelToMedium(uc: UiChannel, ownTwilio: boolean): Medium {
  if (uc === "slack") {
    return uc;
  } else if (uc === "whatsapp") {
    return "whatsapp_poku";
  } else if (uc === "sms") {
    if (ownTwilio) {
      return "sms";
    } else {
      return "sms_poku";
    }
  } else {
    throw new Error("Couldn't find uiChannel");
  }
}

export default function HumanAsATool() {
  const { phoneNumbers, whatsappNumbers, isAuthenticated: hasTwilioCreds, sid, authToken } = useTwilio();

  const [agentNumber, setAgentNumber] = useState("");
  const [hostedAgentNumber] = useState("+16286001841");
  const [waitTime, setWaitTime] = useState(60);
  const [haatMessageCount, setHaatMessageCount] = useState(0);
  const [haatMessageLimit, setHaatMessageLimit] = useState(0);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const [uiChannel, setUiChannel] = useState<UiChannel>("slack");
  const [usingOwnTwilio, setUsingOwnTwilio] = useState(false);
  const [humanNumbers, setHumanNumbers] = useState<{
    slack?: string;
    whatsapp?: string;
    sms?: string;
  }>({});
  const currentHumanNumber = humanNumbers[uiChannel] || "";
  const updateHumanNumber = (val: string) => {
    setHumanNumbers((prev) => ({ ...prev, [uiChannel]: val }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.getAccount();
        if (res.data) {
          const localUiChannel =
            (res.data.medium?.split("_")[0] as UiChannel) ?? "sms";
          setHumanNumbers((prev) => ({
            ...prev,
            [localUiChannel]: res.data?.humanNumber || "",
          }));
          setAgentNumber(res.data.agentNumber || "");
          setWaitTime(res.data.waitTime || 60);
          setUiChannel(localUiChannel);
          setUsingOwnTwilio(res.data.medium === "sms");
          setHaatMessageCount(res.data.haatMessageCount);
          setHaatMessageLimit(res.data.haatMessageLimit);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [phoneNumbers]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await apiClient.saveAccount(
        currentHumanNumber,
        usingOwnTwilio ? agentNumber : hostedAgentNumber,
        waitTime,
        mapUiChannelToMedium(uiChannel, usingOwnTwilio),
      );
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000); // hide message after 2s
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography>
          Enable your AI agent to loop in a human for help. Works with any agent
          that can use MCP.
        </Typography>
        <Typography>
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
      </Box>

      <Steps />

      <Box>
        <Typography
          level="body-sm"
          sx={{ mb: 1 }}
          endDecorator={
            <InfoTooltip
              title={
                <Stack>
                  <Typography level="body-sm" sx={{ mt: 1 }} color="warning">
                    {haatMessageLimit} msgs/month limit when not using own
                    Twilio numbers.
                  </Typography>
                  <Typography level="body-sm" color="warning" sx={{ mb: 1 }}>
                    To increase please contact{" "}
                    <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a>
                  </Typography>
                </Stack>
              }
            />
          }
        >
          Usage: {haatMessageCount} / {haatMessageLimit}
        </Typography>
        <LinearProgress
          determinate
          value={haatMessageCount * (100 / haatMessageLimit)}
        />
      </Box>

      <Box sx={{ display: "flex" }}>
        <MediumSelector uiChannel={uiChannel} setUiChannel={setUiChannel} />
      </Box>

      {uiChannel === "slack" ? (
        <SlackInput value={currentHumanNumber} onChange={updateHumanNumber} />
      ) : uiChannel === "sms" ? (
        <SmsInput
          usingOwnTwilio={usingOwnTwilio}
          setUsingOwnTwilio={setUsingOwnTwilio}
          value={currentHumanNumber}
          onChange={updateHumanNumber}
          agentNumber={agentNumber}
          setAgentNumber={setAgentNumber}
          hasTwilioCreds={hasTwilioCreds}
          phoneNumbers={phoneNumbers}
          whatsappNumbers={whatsappNumbers}
        />
      ) : (
        <WhatsappInput
          value={currentHumanNumber}
          onChange={updateHumanNumber}
        />
      )}

      <WaitTimeInput value={waitTime} onChange={(val) => setWaitTime(val)} />

      <Stack gap={1}>
        <Button
          onClick={handleSave}
          disabled={
            !currentHumanNumber ||
            (!agentNumber && usingOwnTwilio) ||
            (!sid && usingOwnTwilio) ||
            (!authToken && usingOwnTwilio) ||
            saveStatus === "saving"
          }
        >
          Save
        </Button>
        <Button
          onClick={() => apiClient.sendTestMessage()}
          variant="outlined"
          disabled={
            !currentHumanNumber ||
            (!agentNumber && usingOwnTwilio) ||
            (!sid && usingOwnTwilio) ||
            (!authToken && usingOwnTwilio) ||
            saveStatus === "saving"
          }
        >
          Send Test Message
        </Button>
      </Stack>
      {saveStatus === "success" && (
        <Typography color="success">Settings saved!</Typography>
      )}
      {saveStatus === "error" && (
        <Typography color="danger">Failed to save settings.</Typography>
      )}
    </Stack>
  );
}

function SmsInput({
  value,
  onChange,
  usingOwnTwilio,
  setUsingOwnTwilio,
  hasTwilioCreds,
  agentNumber,
  setAgentNumber,
  phoneNumbers,
  whatsappNumbers,
}: {
  value: string;
  onChange: (val: string) => void;
  usingOwnTwilio: boolean;
  setUsingOwnTwilio: (val: boolean) => void;
  hasTwilioCreds: boolean;
  agentNumber: string;
  setAgentNumber: (val: string) => void;
  phoneNumbers: string[];
  whatsappNumbers: string[];
}) {
  return (
    <>
      <Box>
        <Checkbox
          label="Send from my own Twilio number"
          checked={usingOwnTwilio}
          onChange={(e) => setUsingOwnTwilio(e.target.checked)}
        />

        {usingOwnTwilio && !hasTwilioCreds && (
          <Typography color="danger">
            Please go to{" "}
            <Link component={RLink} to="/integrations">
              Integrations
            </Link>{" "}
            to add your Twilio credentials and use your own number.
          </Typography>
        )}

        {usingOwnTwilio && hasTwilioCreds && (
          <Select
            placeholder="Choose a number"
            value={agentNumber || ""}
            onChange={(_event, newPhoneNumber) =>
              setAgentNumber(newPhoneNumber || "")
            }
          >
            {phoneNumbers.concat(whatsappNumbers).map((e) => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>
        )}
      </Box>

      <Box>
        <Typography
          level="title-md"
          endDecorator={
            <InfoTooltip
              title={
                <Typography>
                  Who would you like your AI agent to reach out to in case of an
                  escalation? Enter the number of the human staff member below.
                  This is the person who will respond to the AI agent in case of
                  an escalation.
                </Typography>
              }
            />
          }
        >
          Human Number
        </Typography>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value || "")}
          placeholder="Ex: +12223334444"
        />
      </Box>
    </>
  );
}

function SlackInput({
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

function WhatsappInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <Box>
      <Typography
        level="title-md"
        endDecorator={
          <InfoTooltip
            title={
              <Typography>
                Who would you like your AI agent to reach out to in case of an
                escalation? Enter the number of the human staff member below.
                This is the person who will respond to the AI agent in case of
                an escalation.
              </Typography>
            }
          />
        }
      >
        Human Number
      </Typography>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value || "")}
        placeholder="Ex: +12223334444"
      />
    </Box>
  );
}

function WaitTimeInput(props: {
  value: number;
  onChange: (val: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Typography
        level="title-md"
        endDecorator={
          <InfoTooltip
            title={
              <Typography>
                How long (in seconds) should the AI agent wait for a response
                from the human? If available, set your AI agent"s tool
                connection timeout to at least this long.
              </Typography>
            }
          />
        }
      >
        Wait Time (seconds)
      </Typography>
      <Input
        type="number"
        value={props.value}
        onChange={(e) => props.onChange(+e.target.value)}
        slotProps={{
          input: {
            ref: inputRef,
            min: 1,
            max: 600,
          },
        }}
      />
    </Box>
  );
}

function MediumSelector({
  uiChannel: uiChannel,
  setUiChannel: setUiChannel,
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
              }[item]
            }
            variant={uiChannel === item ? "solid" : "plain"}
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
