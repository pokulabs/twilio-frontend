import { useState } from "react";
import {
  Typography,
  Box,
  Link,
  Tabs,
  TabList,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  RadioGroup,
  Radio,
  Sheet,
  radioClasses,
  FormLabel,
} from "@mui/joy";
import { Link as RLink } from "react-router-dom";

export default function Steps() {
  const [selectedPlatform, setSelectedPlatform] = useState(0);

  return (
    <Box>
      <Typography sx={{ mb: 1 }}>
        <b>Step 1.</b> What platform is your AI agent hosted on?
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <RadioGroup
          orientation="horizontal"
          value={selectedPlatform}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedPlatform(+event.target.value)
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
              value: 0,
              label: "Retell (API tool call)",
            },
            {
              value: 1,
              label: "Vapi, n8n (MCP tool call)",
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

      {/* Step 2 - Conditionally rendered based on tab */}
      {selectedPlatform === 0 ? (
        <AccordionGroup>
          <Accordion sx={{ mt: 2, p: 0 }}>
            <AccordionSummary sx={{ fontWeight: "normal" }}>
              <Box>
                <b>Step 2.</b> Create a custom function for your Retell agent.
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ ml: 1 }}>
              <Typography sx={{ mb: 1 }}>
                <b>2.1</b> Go to the{" "}
                <Link component={RLink} to="/">
                  Account
                </Link>{" "}
                page to generate your Poku API key.
              </Typography>

              <Typography>
                <b>2.2</b> Navigate to your Retell AI agent and create a new
                custom function
              </Typography>

              <img
                src="/assets/retell-function.png"
                alt="Screenshot of Retell Custom Function"
                style={{ width: "100%", maxWidth: 500, marginBottom: 16 }}
              />
              <Typography>
                <strong>Name:</strong> <code>contact_human</code>
                <br />
                <strong>API Endpoint:</strong>{" "}
                <code>POST https://api.pokulabs.com/hitl</code>
                <br />
                <strong>Timeout (ms):</strong> <code>120000</code>
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Headers:</strong>
                <br />
                <code>Authorization: Bearer YOUR_POKU_API_KEY</code>
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>JSON Parameters:</strong>
              </Typography>
              <img
                src="/assets/retell-json.png"
                alt="Screenshot of JSON Parameters"
                style={{ width: "100%", maxWidth: 500 }}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      ) : (
        <AccordionGroup>
          <Accordion sx={{ mt: 2, p: 0 }}>
            <AccordionSummary sx={{ fontWeight: "normal" }}>
              <Box>
                <b>Step 2.</b> Connect your agent to the Poku MCP server.
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ ml: 1 }}>
              <Typography sx={{ mb: 1 }}>
                <b>2.1</b> Go to the{" "}
                <Link component={RLink} to="/">
                  Account
                </Link>{" "}
                page to generate your Poku API key.
              </Typography>

              <Typography>
                <b>2.2</b> Navigate to your agent and add a new tool to create a
                MCP connection
              </Typography>
              <Typography>
                <strong>Server URL:</strong>{" "}
                <code>https://mcp.pokulabs.com/stream</code>
                <br />
                <strong>Timeout:</strong> <code>120 seconds</code>
                <br />
                <strong>HTTP Headers:</strong>{" "}
                <code>Authorization: Bearer YOUR_POKU_API_KEY</code>
              </Typography>
              <img
                src="/assets/vapi-n8n.png"
                alt="Screenshot of Vapi & n8n MCP setup"
                style={{ width: "100%", maxWidth: 500, marginTop: 16 }}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      )}

      {/* Step 3 - Shared across both options */}
      <AccordionGroup>
        <Accordion sx={{ mt: 2, p: 0 }}>
          <AccordionSummary sx={{ fontWeight: "normal" }}>
            <Box>
              <b>Step 3.</b> Update your AI agent prompt to use the{" "}
              <code>contact_human</code> tool.
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 1 }}>
            <Typography>
              If you're not sure how to handle a message, use the{" "}
              <code>contact_human</code> tool with the user’s phone number.
              We'll take over the conversation via SMS.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>

      <Typography sx={{ mt: 2 }}>
        <b>Step 4.</b> Provide the numbers your agent will reach out to and from
        when it contacts a human. Configure below.
      </Typography>
    </Box>
  );
}
