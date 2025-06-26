import { useEffect, useState } from "react";
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
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";

export default function HumanAsATool() {
  const { phoneNumbers, whatsappNumbers, sid, authToken } = useTwilio();
  const [humanNumber, setHumanNumber] = useState("");
  const [agentNumber, setAgentNumber] = useState("");
  const [hostedAgentNumber, setHostedAgentNumber] = useState("+16286001841");
  const [waitTime, setWaitTime] = useState(60);
  const [usingHostedNumber, setUsingHostedNumber] = useState(true);
  const [haatMessageCount, setHaatMessageCount] = useState(0);
  const [haatMessageLimit, setHaatMessageLimit] = useState(0);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

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
        if (twilioCredsExist.data.hasKey) {
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
        humanNumber,
        usingHostedNumber ? hostedAgentNumber : agentNumber,
        waitTime,
        usingHostedNumber,
      );
      await apiClient.createTwilioKey(sid, authToken);
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
          Enable your AI agent to loop in a human for help via SMS.
        </Typography>
        {/* <Typography>Learn more here</Typography> */}
      </Box>

      <Stack spacing={1}>
        <Box>
          <Typography level="h4">Agent Number</Typography>
          <Typography level="body-sm">
            The number your agent will reach out from
          </Typography>
        </Box>
        <NumberType
          agentNumberSource={usingHostedNumber}
          setAgentNumberSource={setUsingHostedNumber}
        />

        {!usingHostedNumber ? (
          <Select
            placeholder="Choose a number"
            value={agentNumber || ""}
            onChange={(_event, newPhoneNumber) =>
              setAgentNumber(newPhoneNumber!)
            }
          >
            {phoneNumbers.concat(whatsappNumbers).map((e) => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>
        ) : (
          <Input disabled={true} value={`Poku's agent number: ` + hostedAgentNumber} />
        )}

        {usingHostedNumber && (
          <Box>
            <Typography level="body-sm">
              Usage: {haatMessageCount} / {haatMessageLimit}
            </Typography>

            <LinearProgress
              determinate
              value={haatMessageCount * (100 / haatMessageLimit)}
            />

            <Typography sx={{ mt: 1 }} level="body-xs" color="warning">
              ⚠️ {haatMessageLimit} messages/month limit when using a free Poku number.
            </Typography>
            <Typography level="body-xs" color="warning">
              To increase please contact us at{" "}
              <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a>
            </Typography>
          </Box>
        )}
      </Stack>

      <Box>
        <Typography level="h4">Human Number</Typography>
        <Typography level="body-sm">
          The number your agent will contact
        </Typography>
        <Input
          value={humanNumber}
          onChange={(e) => setHumanNumber(e.target.value || "")}
          placeholder="+12223334444"
        />
      </Box>

      <Box>
        <Typography level="h4">Wait Time</Typography>
        <Typography level="body-sm">
          How long (in seconds) the agent will wait for a human response
        </Typography>
        <Input
          type="number"
          value={waitTime}
          onChange={(e) => setWaitTime(+e.target.value)}
        />
      </Box>

      <Button
        onClick={handleSave}
        disabled={
          !humanNumber ||
          !agentNumber ||
          !sid ||
          !authToken ||
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
          minHeight: 48,
          padding: "6px",
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
              label: ({ checked }) => ({
                sx: {
                  fontWeight: checked ? "bold" : "normal",
                },
              }),
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
}
