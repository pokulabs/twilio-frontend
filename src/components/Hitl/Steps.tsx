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
} from "@mui/joy";
import { Link as RLink } from "react-router-dom";

export default function Steps() {
    const [selectedPlatform, setSelectedPlatform] = useState(0);
  
    return (
      <Box>
        <AccordionGroup disableDivider>

            <Typography sx={{ mb: 1 }}>
            <b>Step 1.</b> What platform is your AI agent hosted on?
            </Typography>
    
            <Tabs
            value={selectedPlatform}
            onChange={(_, val) => setSelectedPlatform(val as number)}
            sx={{ border: "none" }}
            >
            <TabList>
                <Tab>Retell AI (API tool call)</Tab>
                <Tab>Vapi, n8n (MCP tool call)</Tab>
            </TabList>
            </Tabs>
    
            {/* Step 2 - Conditionally rendered based on tab */}
            {selectedPlatform === 0 ? (
            <>
                <Typography sx={{ mt: 3 }}>
                <b>Step 2.</b> Create a custom function for your Retell AI agent.
                </Typography>
                <Accordion sx={{ mt: 2 }}>
                <AccordionSummary>
                    Show setup instructions
                </AccordionSummary>
                <AccordionDetails>
                    <Typography sx={{ mb: 1 }}>
                    Go to the{" "}
                    <Link component={RLink} to="/">
                        Accounts
                    </Link>{" "}
                    page to generate your Poku API key.
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
            </>
            ) : (
            <>
                <Typography sx={{ mt: 3 }}>
                <b>Step 2.</b> Create an MCP connection to give your AI agent access to the Poku{" "}
                <code>contact_human</code> tool.
                </Typography>
    
                <Accordion sx={{ mt: 2 }}>
                <AccordionSummary>
                    Show setup instructions
                </AccordionSummary>
                <AccordionDetails>
                    <img
                    src="/assets/vapi-n8n.png"
                    alt="Screenshot of Vapi & n8n MCP setup"
                    style={{ width: "100%", maxWidth: 500, marginBottom: 16 }}
                    />
                    <Typography>
                    <strong>Server URL:</strong>{" "}
                    <code>https://mcp.pokulabs.com/stream</code>
                    <br />
                    <strong>Timeout:</strong> <code>120 seconds</code>
                    <br />
                    <strong>HTTP Headers:</strong>{" "}
                    <code>Authorization: Bearer YOUR_POKU_API_KEY</code>
                    </Typography>
                </AccordionDetails>
                </Accordion>
            </>
            )}
    
            {/* Step 3 - Shared across both options */}
            <Typography sx={{ mt: 4 }}>
            <b>Step 3.</b> Update your AI agent prompt to use the <code>contact_human</code> tool.
            </Typography>
    
            <Accordion sx={{ mt: 2 }}>
            <AccordionSummary>
                Show example prompt
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                If you're not sure how to handle a message, use the{" "}
                <code>contact_human</code> tool with the user’s phone number. We'll
                take over the conversation via SMS.
                </Typography>
            </AccordionDetails>
            </Accordion>
        </AccordionGroup>
      </Box>
    );
  }