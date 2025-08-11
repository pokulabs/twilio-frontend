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
  IconButton,
  Tooltip,
  Divider,
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";
import { InfoOutlined } from "@mui/icons-material";
import { Link as RLink } from "react-router-dom";
import Steps from "./Steps";

export default function HumanAsATool() {
  const { phoneNumbers, whatsappNumbers, sid, authToken } = useTwilio();
  const [humanNumber, setHumanNumber] = useState("");
  const [agentNumber, setAgentNumber] = useState("");
  const [hostedAgentNumber] = useState("+16286001841");
  const [waitTime, setWaitTime] = useState(60);
  const [usingHostedNumber, setUsingHostedNumber] = useState(true);
  const [haatMessageCount, setHaatMessageCount] = useState(0);
  const [haatMessageLimit, setHaatMessageLimit] = useState(0);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [hasTwilioCreds, setHasTwilioCreds] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.getAccount();
        if (res.data) {
          setHumanNumber(res.data.humanNumber || "");
          setAgentNumber(res.data.agentNumber || "");
          setWaitTime(res.data.waitTime || 60);
          setUsingHostedNumber(res.data.usingHostedNumber ?? true);
          setHaatMessageCount(res.data.haatMessageCount);
          setHaatMessageLimit(res.data.haatMessageLimit);
        }

        const twilioCredsExist = await apiClient.checkTwilioCredsExist();
        setHasTwilioCreds(twilioCredsExist.data.hasKey);
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
        humanNumber,
        usingHostedNumber ? hostedAgentNumber : agentNumber,
        waitTime,
        usingHostedNumber,
      );
      if (sid && authToken) {
        await apiClient.createTwilioKey(sid, authToken);
      }
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
          Enable your AI agent to loop in a human for help via SMS. Works with any agent that can use MCP.
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

      <Stack spacing={1}>
        <Box>
          <Typography
            level="title-md"
            endDecorator={
              <Tooltip
                sx={{ maxWidth: 400, zIndex: 10000 }}
                enterTouchDelay={0}
                leaveDelay={100}
                leaveTouchDelay={10000}
                variant="outlined"
                placement="bottom"
                arrow
                title={
                  <Typography>
                    Your AI agent will text a human for help using the number
                    you choose below. You can choose to use a number provided by
                    Poku or a Twilio number you own that is approved for SMS
                    messages.
                  </Typography>
                }
              >
                <IconButton size="sm">
                  <InfoOutlined />
                </IconButton>
              </Tooltip>
            }
          >
            Agent Number
          </Typography>
        </Box>
        <NumberType
          agentNumberSource={usingHostedNumber}
          setAgentNumberSource={setUsingHostedNumber}
        />

        <AgentNumberSelector
          usingHostedNumber={usingHostedNumber}
          agentNumber={agentNumber}
          setAgentNumber={setAgentNumber}
          hostedAgentNumber={hostedAgentNumber}
          phoneNumbers={phoneNumbers}
          whatsappNumbers={whatsappNumbers}
          hasTwilioCreds={hasTwilioCreds}
        />

        {usingHostedNumber && (
          <Box>
            <HostedNumberLimitWarning
              count={haatMessageCount}
              limit={haatMessageLimit}
            />
            <LinearProgress
              determinate
              value={haatMessageCount * (100 / haatMessageLimit)}
            />
          </Box>
        )}
      </Stack>

      <HumanNumberInput
        value={humanNumber}
        onChange={(val) => setHumanNumber(val)}
      />

      <WaitTimeInput value={waitTime} onChange={(val) => setWaitTime(val)} />

      <Button
        onClick={handleSave}
        disabled={
          !humanNumber ||
          (!agentNumber && !usingHostedNumber) ||
          (!sid && !usingHostedNumber) ||
          (!authToken && !usingHostedNumber) ||
          saveStatus === "saving"
        }
      >
        Save
      </Button>
      {saveStatus === "success" && (
        <Typography color="success">Settings saved!</Typography>
      )}
      {saveStatus === "error" && (
        <Typography color="danger">Failed to save settings.</Typography>
      )}
    </Stack>
  );
}

function NumberType(props: {
  agentNumberSource: boolean;
  setAgentNumberSource: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <RadioGroup
        orientation="horizontal"
        value={props.agentNumberSource}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.setAgentNumberSource(event.target.value === "true")
        }
        sx={{
          width: "100%",
          minHeight: 35,
          padding: "4px",
          borderRadius: "12px",
          bgcolor: "neutral.softBg",
          "--RadioGroup-gap": "4px",
          "--Radio-actionRadius": "8px",
        }}
      >
        {[
          {
            value: true,
            label: "Free Poku number",
          },
          {
            value: false,
            label: "Your Twilio number",
          },
        ].map((item) => (
          <Radio
            key={item.value.toString()}
            color="neutral"
            value={item.value}
            disableIcon
            label={item.label}
            variant="plain"
            sx={{
              px: 2,
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
              textAlign: "center",
            }}
            slotProps={{
              action: ({ checked }) => ({
                sx: {
                  ...(checked && {
                    bgcolor: "background.surface",
                    boxShadow: "sm",
                    "&:hover": {
                      bgcolor: "background.surface",
                    },
                  }),
                },
              }),
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
}

function HostedNumberLimitWarning({
  count,
  limit,
}: {
  count: number;
  limit: number;
}) {
  return (
    <Typography
      level="body-sm"
      endDecorator={
        <Tooltip
          sx={{ maxWidth: 400, zIndex: 10000 }}
          enterTouchDelay={0}
          leaveDelay={100}
          leaveTouchDelay={10000}
          variant="outlined"
          placement="bottom"
          arrow
          title={
            <Stack>
              <Typography sx={{ mt: 1 }} color="warning">
                ⚠️ {limit} msgs/month limit when using a free Poku number.
              </Typography>
              <Typography color="warning">
                To increase please contact{" "}
                <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a>
              </Typography>
            </Stack>
          }
        >
          <IconButton size="sm">
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      }
    >
      Usage: {count} / {limit}
    </Typography>
  );
}

function AgentNumberSelector(props: {
  usingHostedNumber: boolean;
  agentNumber: string;
  setAgentNumber: (val: string) => void;
  hostedAgentNumber: string;
  phoneNumbers: string[];
  whatsappNumbers: string[];
  hasTwilioCreds: boolean;
}) {
  if (props.usingHostedNumber) {
    return (
      <Input
        readOnly
        value={props.hostedAgentNumber}
        startDecorator={
          <>
            <Typography sx={{ pr: 1.5 }}>Poku's number:</Typography>
            <Divider orientation="vertical" />
          </>
        }
      />
    );
  }

  if (!props.hasTwilioCreds) {
    return (
      <Typography color="danger">
        Please go to{" "}
        <Link component={RLink} to="/integrations">
          Integrations
        </Link>{" "}
        to add your Twilio credentials and use your own number.
      </Typography>
    );
  }

  return (
    <Select
      placeholder="Choose a number"
      value={props.agentNumber || ""}
      onChange={(_event, newPhoneNumber) =>
        props.setAgentNumber(newPhoneNumber || "")
      }
    >
      {props.phoneNumbers.concat(props.whatsappNumbers).map((e) => (
        <Option key={e} value={e}>
          {e}
        </Option>
      ))}
    </Select>
  );
}

function HumanNumberInput(props: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <Box>
      <Typography
        level="title-md"
        endDecorator={
          <Tooltip
            sx={{ maxWidth: 400, zIndex: 10000 }}
            enterTouchDelay={0}
            leaveDelay={100}
            leaveTouchDelay={10000}
            variant="outlined"
            placement="bottom"
            arrow
            title={
              <Typography>
                Who would you like your AI agent to reach out to in case of an
                escalation? Enter the number of the human staff member below.
                This is the person who will respond to the AI agent in case of
                an escalation.
              </Typography>
            }
          >
            <IconButton size="sm">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        }
      >
        Human Number
      </Typography>
      <Input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value || "")}
        placeholder="Use format: +12223334444"
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
          <Tooltip
            sx={{ maxWidth: 400, zIndex: 10000 }}
            enterTouchDelay={0}
            leaveDelay={100}
            leaveTouchDelay={10000}
            variant="outlined"
            placement="bottom"
            arrow
            title={
              <Typography>
                How long (in seconds) should the AI agent wait for a response
                from the human? If available, set your AI agent's tool
                connection timeout to at least this long.
              </Typography>
            }
          >
            <IconButton size="sm">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
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
