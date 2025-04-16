import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Input,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { accordionContent } from "./webhook-docs";
import { useCredentials } from "../../context/CredentialsContext";
import { useWebhook } from "../../hooks/use-webhook";

export default function Webhooks() {
  const {
    webhookUrl,
    setWebhookUrl,
    webhooksActivationStatus,
    setWebhooksActivationStatus,
  } = useCredentials();

  return (
    <Box>
      <Typography level="h4" sx={{ mb: 2 }}>
        Webhooks
      </Typography>

      <Stack spacing={2} role="group" sx={{ mb: 4 }}>
        <Stack>
          <AccordionGroup variant="outlined">
            {accordionContent.map((content, index) => (
              <Accordion key={index}>
                <AccordionSummary>
                  <Checkbox
                    checked={webhooksActivationStatus[content.id]}
                    sx={{ marginRight: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      setWebhooksActivationStatus(content.id, e.target.checked);
                    }}
                  />
                  {content.name}
                </AccordionSummary>
                <AccordionDetails>
                  {content.description.map((text, idx) => {
                    return text.includes("{") ? (
                      <Sheet
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 1,
                          m: 0.5,
                          borderRadius: "md",
                          bgcolor: "background.level1",
                          overflowX: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {text}
                      </Sheet>
                    ) : (
                      <Typography key={idx}>{text}</Typography>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionGroup>
        </Stack>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <Typography level="title-lg" sx={{ mb: 2 }}>
          Webhook URL
        </Typography>
        <Box sx={{ display: "flex", width: "100%" }}>
          <Input
            placeholder="https://hook.us2.make.com/a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            sx={{ flexGrow: 1, marginRight: 1 }}
          />
        </Box>
      </Box>

      <TestWebhook />
    </Box>
  );
}

function TestWebhook() {
  const { webhookUrl } = useCredentials();
  const { webhookClient } = useWebhook();
  const [selectedOption, setSelectedOption] = React.useState(
    accordionContent[0].name,
  );

  const handleSend = () => {
    const selectedContent = accordionContent.find(
      (content) => content.name === selectedOption,
    );
    if (selectedContent?.testFunction) {
      const { name, args } = selectedContent.testFunction;
      if ((webhookClient as any)[name]) {
        (webhookClient as any)
          [name](...args)
          .then(() => console.log("Webhook function executed successfully"))
          .catch((err: any) =>
            console.error("Error executing webhook function:", err),
          );
      } else {
        console.error("Function not found on webhookClient:", name);
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography level="title-lg" sx={{ mb: 2 }}>
        Test Webhook
      </Typography>

      <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
        <Select
          sx={{ flexGrow: 1 }}
          value={selectedOption}
          onChange={(_event, value) => {
            if (value) {
              setSelectedOption(value);
            }
          }}
        >
          {accordionContent.map((content, index) => (
            <Option key={index} value={content.name}>
              {content.name}
            </Option>
          ))}
        </Select>

        <Button disabled={!webhookUrl} color="primary" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Box>
  );
}
