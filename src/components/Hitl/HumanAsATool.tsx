import { useEffect, useState } from "react";
import { Button, Typography, Input, Stack, Select, Option, Box, Radio, RadioGroup, LinearProgress } from "@mui/joy";
import { apiClient } from "../../api-client";
import { useTwilio } from "../../context/TwilioProvider";

export default function HumanAsATool() {
  const { phoneNumbers, whatsappNumbers, sid, authToken } = useTwilio();
  const [humanNumber, setHumanNumber] = useState("");
  const [agentNumber, setAgentNumber] = useState("");
  const [hostedAgentNumber, setHostedAgentNumber] = useState("+16286001841");
  const [messageLimit, setMessageLimit] = useState(50);
  const [waitTime, setWaitTime] = useState<number>(60);
  const [usingHostedNumber, setUsingHostedNumber] = useState(true);
  const [haatMessageCount, setHaatMessageCount] = useState(0);

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
    await apiClient.saveAccount(humanNumber, usingHostedNumber ? hostedAgentNumber : agentNumber, waitTime, usingHostedNumber);
    await apiClient.createTwilioKey(sid, authToken);
  };

  return (
    <Stack spacing={2}>
      <Typography level="h4">Human in the Loop</Typography>
      <NumberType agentNumberSource={usingHostedNumber} setAgentNumberSource={setUsingHostedNumber} />

      {usingHostedNumber && (
        <Box>
          <Typography level="body-sm">
            Usage: {haatMessageCount} / {messageLimit}
          </Typography>


          <LinearProgress determinate value={haatMessageCount * (100 / messageLimit)} />

          <Typography sx={{mt: 1}} level="body-xs" color="warning">
            ⚠️ 50 messages/month limit when using a free Poku number.  
          </Typography>
          <Typography level="body-xs" color="warning">
            To increase please contact us at <a href="mailto:hello@pokulabs.com">hello@pokulabs.com</a>
          </Typography>
        </Box>
      )}

      <Box>
        <Typography level="body-sm">
          Agent number: the number your agent will reach out from
        </Typography>
        {!usingHostedNumber ? (
          <Select
            placeholder="Choose a number"
            value={agentNumber || ""}
            onChange={(_event, newPhoneNumber) => setAgentNumber(newPhoneNumber!)}
          >
            {phoneNumbers.concat(whatsappNumbers).map((e) => (
              <Option key={e} value={e}>
                {e}
              </Option>
            ))}
          </Select>
        ) : (
          <Input disabled={true} value={hostedAgentNumber} />
        )}
      </Box>

      <Box>
        <Typography level="body-sm">
          Human number: the number your agent will contact
        </Typography>
        <Input
          value={humanNumber}
          onChange={(e) => setHumanNumber(e.target.value || "")}
          placeholder="+12223334444"
        />
      </Box>

      <Box>
        <Typography level="body-sm">
          Wait time: how long (in seconds) the agent will wait for a human
          response:
        </Typography>
        <Input
          type="number"
          value={waitTime}
          onChange={(e) => setWaitTime(+e.target.value)}
        />
      </Box>

      <Button
        onClick={handleSave}
        disabled={!humanNumber || !agentNumber || !sid || !authToken}
      >
        Save
      </Button>
    </Stack>
  );
}


function NumberType(props: { agentNumberSource: boolean, setAgentNumberSource: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <RadioGroup
        orientation="horizontal"
        value={props.agentNumberSource}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.setAgentNumberSource(event.target.value === "true")
        }
        sx={{
          minHeight: 48,
          padding: '6px',
          borderRadius: '12px',
          bgcolor: 'neutral.softBg',
          '--RadioGroup-gap': '4px',
          '--Radio-actionRadius': '8px',
        }}
      >
        {[{
          value: true,
          label: "Use Poku number"
        },
        {
          value: false,
          label: "Use own Twilio number"
        }].map((item) => (
          <Radio
            key={item.value.toString()}
            color="neutral"
            value={item.value}
            disableIcon
            label={item.label}
            variant="plain"
            sx={{ px: 2, alignItems: 'center' }}
            slotProps={{
              action: ({ checked }) => ({
                sx: {
                  ...(checked && {
                    bgcolor: 'background.surface',
                    boxShadow: 'sm',
                    '&:hover': {
                      bgcolor: 'background.surface',
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