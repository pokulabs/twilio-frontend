import { useEffect, useRef, useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
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
  const {
    phoneNumbers,
    whatsappNumbers,
    isAuthenticated: hasTwilioCreds,
    sid,
    authToken,
  } = useTwilio();

  const [channelId, setChannelId] = useState("");
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
        const limits = await apiClient.getAccountLimits();
        const res = await apiClient.getAccount();
        if (res.data?.data.length) {
          const [ic] = res.data.data;
          const localUiChannel =
            (ic.medium?.split("_")[0] as UiChannel) ?? "sms";
          setHumanNumbers((prev) => ({
            ...prev,
            [localUiChannel]: ic?.humanNumber || "",
          }));
          setAgentNumber(ic.agentNumber || "");
          setWaitTime(ic.waitTime || 60);
          setUiChannel(localUiChannel);
          setUsingOwnTwilio(ic.medium === "sms");
          setHaatMessageCount(limits.data.haatMessageCount);
          setHaatMessageLimit(limits.data.haatMessageLimit);
          setChannelId(ic.id);
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
      if (channelId) {
        await apiClient.deleteInteractionChannel(channelId);
      }
      const res = await apiClient.saveAccount(
        currentHumanNumber,
        usingOwnTwilio ? agentNumber : hostedAgentNumber,
        waitTime,
        mapUiChannelToMedium(uiChannel, usingOwnTwilio),
      );
      setChannelId(res.data.id);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000); // hide message after 2s
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const saveStatusMessages = {
    success: { color: "green", text: "Settings saved!" },
    error: { color: "red", text: "Failed to save settings" },
    idle: { color: "white", text: "Save" },
    saving: { color: "white", text: "Saving..." },
  } as const;

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
        <Stack direction="row" alignItems="center">
          <Typography variant="body1">
            Usage: {haatMessageCount} / {haatMessageLimit}
          </Typography>
          <InfoTooltip
            title={
              <Stack>
                <Typography variant="body2" sx={{ mt: 1 }} color="red">
                  {haatMessageLimit} msgs/month limit when not using own Twilio
                  numbers.
                </Typography>
                <Typography variant="body2" color="red" sx={{ mb: 1 }}>
                  To increase please contact{" "}
                  <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a>
                </Typography>
              </Stack>
            }
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={haatMessageCount * (100 / haatMessageLimit)}
        />
      </Box>

      <Box sx={{ display: "flex" }}>
        <MediumSelector uiChannel={uiChannel} setUiChannel={setUiChannel} setUsingOwnTwilio={setUsingOwnTwilio} />
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
          variant={
            saveStatus == "idle" || saveStatus == "saving"
              ? "contained"
              : "outlined"
          }
          onClick={handleSave}
          disabled={
            !currentHumanNumber ||
            (!agentNumber && usingOwnTwilio) ||
            (!sid && usingOwnTwilio) ||
            (!authToken && usingOwnTwilio) ||
            saveStatus === "saving"
          }
          sx={{
            ...(saveStatus === "success" && {
              borderColor: "success.main",
            }),
            ...(saveStatus === "error" && {
              borderColor: "error.main",
            }),
          }}
        >
          <Typography sx={{ color: saveStatusMessages[saveStatus].color }}>
            {saveStatusMessages[saveStatus].text}
          </Typography>
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
          Send Test Messages
        </Button>
      </Stack>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={usingOwnTwilio}
              onChange={(e) => setUsingOwnTwilio(e.target.checked)}
              sx={{}}
            />
          }
          label="Send from my own Twilio number"
        />

        {usingOwnTwilio && !hasTwilioCreds && (
          <Typography color="red">
            Please go to{" "}
            <Link component={RLink} to="/integrations">
              Integrations
            </Link>{" "}
            to add your Twilio credentials and use your own number.
          </Typography>
        )}

        {usingOwnTwilio && hasTwilioCreds && (
          <FormControl fullWidth size="small">
            <InputLabel id="agent-number-label">Choose a number</InputLabel>
            <Select
              label="agent-number-label"
              value={agentNumber || ""}
              onChange={(e) => setAgentNumber(e.target.value)}
              renderValue={(selected) => {
                if (!selected) return "Choose a number";
                return selected;
              }}
            >
              {phoneNumbers.concat(whatsappNumbers).map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box>
        <Stack direction="row" alignItems="center">
          <Typography variant="body1">Human Number</Typography>
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
        </Stack>

        <TextField
          size="small"
          sx={{ width: 470 }}
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
      <Typography variant="body1">
        Join our <Link href={SLACK_LINK}>Slack channel</Link> and reply in a
        thread to your agent.
      </Typography>
      <Box>
        <Stack direction="row" alignItems="center">
          <Typography variant="body1">Slack User ID</Typography>
          <InfoTooltip
            title={
              <Typography>
                This is the human your AI will reach out to in case of an
                interaction. In Slack, go to your user profile. Then click the 3
                vertical dots button. Select "Copy Member ID" and paste it here.
              </Typography>
            }
          />
        </Stack>

        <TextField
          sx={{ width: 470 }}
          size="small"
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
      <Stack direction="row" alignItems="center">
        <Typography variant="body1"> Human Number </Typography>
        <InfoTooltip
          title={
            <Typography>
              Who would you like your AI agent to reach out to in case of an
              escalation? Enter the number of the human staff member below. This
              is the person who will respond to the AI agent in case of an
              escalation.
            </Typography>
          }
        />
      </Stack>

      <TextField
        size="small"
        sx={{ width: 470 }}
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
      <Stack direction="row" alignItems="center">
        <Typography variant="body1"> Wait Time (seconds) </Typography>
        <InfoTooltip
          title={
            <Typography>
              How long (in seconds) should the AI agent wait for a response from
              the human? If available, set your AI agent"s tool connection
              timeout to at least this long.
            </Typography>
          }
        />
      </Stack>

      <TextField
        size="small"
        sx={{ width: 470 }}
        type="number"
        value={props.value}
        onChange={(e) => props.onChange(+e.target.value)}
        slotProps={{
          input: {
            inputProps: {
              min: 1,
              max: 600,
            },
          },
        }}
        inputRef={inputRef}
      />
    </Box>
  );
}

function MediumSelector({
  uiChannel: uiChannel,
  setUiChannel: setUiChannel,
  setUsingOwnTwilio: setUsingOwnTwilio,

}: {
  uiChannel: UiChannel;
  setUiChannel: (m: UiChannel) => void;
  setUsingOwnTwilio: (value: boolean) => void;

}) {
  return (
    <ToggleButtonGroup
      orientation="horizontal"
      aria-label="Alignment"
      value={uiChannel}
      exclusive
      onChange={(
        _event: React.MouseEvent<HTMLElement>,
        newValue: string | null,
      ) => {
        if (newValue !== null) {
          setUiChannel(newValue as UiChannel);

          if(newValue !== "sms") {
            setUsingOwnTwilio(false)
          }
        }
      }}
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      {["sms", "whatsapp", "slack"].map((item) => (
        <ToggleButton
          key={item}
          value={item}
          aria-label={item}
          sx={{
            position: "relative",
            flex: 1,
            height: 35,
            textTransform: "none",
            borderRadius: 0,
            color: "black",
            "&:first-of-type": {
              borderTopLeftRadius: (theme) => theme.shape.borderRadius,
              borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            },
            "&:last-of-type": {
              borderTopRightRadius: (theme) => theme.shape.borderRadius,
              borderBottomRightRadius: (theme) => theme.shape.borderRadius,
            },
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
          }}
        >
          {
            {
              slack: "Slack",
              whatsapp: "WhatsApp",
              sms: "SMS",
            }[item]
          }
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
