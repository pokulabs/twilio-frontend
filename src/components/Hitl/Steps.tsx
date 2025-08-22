import { useState } from "react";
import {
  Typography,
  Box,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  RadioGroup,
  Radio,
} from "@mui/joy";
import { Link as RLink } from "react-router-dom";
import n8nImg from "../../assets/n8n-contact-human-mcp.png";
import retellMcpImg from "../../assets/retell-mcp.png";
import retellMcpProxyImg from "../../assets/retell-mcp-proxy.png";
import vapiMcpImg from "../../assets/vapi-mcp.png";
import vapiMcpProxyImg from "../../assets/vapi-mcp-proxy.png";

const mapContactHumanExamples = {
  n8n: n8nImg,
  retell: retellMcpImg,
  vapi: vapiMcpImg,
};

const mapToolApprovalExamples = {
  retell: retellMcpProxyImg,
  vapi: vapiMcpProxyImg,
};

export default function Steps() {
  const [selectedTool, setSelectedTool] = useState(0);

  return (
    <Box>
      <Typography sx={{ mb: 1 }}>
        <b>Step 1.</b> Choose a human-in-the-loop feature
      </Typography>


      <Box sx={{ display: "flex", gap: 2 }}>
        <RadioGroup
          orientation="horizontal"
          value={selectedTool}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedTool(+event.target.value)
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
              value: 0,
              label: "contact_human",
            },
            {
              value: 1,
              label: "tool_approval",
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

      {selectedTool === 0 ? (
        <Typography level="body-sm" sx={{ mt: 1 }}>
          Enable your agent to ask a human for help in real-time. The agent
          continues the conversation after input from a human.
        </Typography>
      ) : (
        <Typography level="body-sm" sx={{ mt: 1 }}>
          Require human approval before executing an MCP
          tool call.
        </Typography>
      )}
      
      {selectedTool === 0 ? (
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

              <Typography sx={{ mb: 1 }}>
                <b>2.2</b> Navigate to your agent and create a MCP connection
              </Typography>

              <ContactHumanExamples />

              <Typography sx={{ mt: 1 }}>
                <strong>Server URL (Streamable):</strong>{" "}
              </Typography>
              <CodeBlock text="https://mcp.pokulabs.com" />
              <Typography sx={{ mt: 1 }}>
                <strong>Server URL (SSE):</strong>{" "}
              </Typography>
              <CodeBlock text="https://mcp.pokulabs.com/sse" />
              <Typography sx={{ mb: 1, mt: 1 }}>
                <strong>Timeout:</strong>
                <br />
                60 sec (use same value as Wait Time in Step 4)
              </Typography>
              <Typography>
                <strong>Headers:</strong>{" "}
              </Typography>
              <CodeBlock text="Authorization: Bearer <YOUR_POKU_KEY>" />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      ) : (
        <AccordionGroup>
          <Accordion sx={{ mt: 2, p: 0 }}>
            <AccordionSummary sx={{ fontWeight: "normal" }}>
              <Box>
                <b>Step 2.</b> Connect your agent to the Poku MCP Proxy server.
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

              <Typography sx={{ mb: 1 }}>
                <b>2.2</b> Navigate to your agent and create a MCP connection
              </Typography>

              {/* <img
                src={n8nImg}
                style={{
                  width: "100%",
                  maxWidth: 400,
                  border: "1px solid silver",
                }}
              /> */}

              <Typography>
                <strong>Server URL (Streamable):</strong>{" "}
              </Typography>
              <CodeBlock text="https://mcp-proxy.pokulabs.com?url=<YOUR_MCP_URL>" />
              <Typography>
                Replace <code>{"<YOUR_MCP_URL>"}</code> with the url of the MCP server you want to gate with human approval.
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Timeout:</strong>
                <br />
                60 sec (use same value as Wait Time in Step 4)
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Headers:</strong>{" "}
              </Typography>
              <CodeBlock text="Poku-Authorization: Bearer <YOUR_POKU_KEY>" />
              <Typography sx={{ mt: 1 }}></Typography>
              <CodeBlock text="Authorization: Bearer <YOUR_MCP_AUTH_KEY>" optional/>
              <Typography sx={{ mt: 1 }}></Typography>
              <ToolApprovalExamples />

              <Typography sx={{ mt: 1 }}>
                <b>2.3</b> Select the tool(s) you want to gate with human approval.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      )}
      

      {selectedTool === 0 && (
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
                <b>Sample prompt 1:</b>
                <br />
              </Typography>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                When you encounter a question that's outside the scope of the
                knowledge base, immediately use the <b>contact_human</b> tool to
                request help from a manager.
              </Typography>

              <Typography>
                <b>Sample prompt 2:</b>
              </Typography>
              <Typography level="body-sm">
                ## Tool
                <br />
                0. If you need manager input (see “Escalate When” list) you MUST
                <br />
                - first get user consent to be put on hold by asking "Is it ok
                if I put you on a brief hold while I check with my manager?"
                <br />
                - if user says yes, use <b>contact_human</b> tool.
                <br />
                Tool calls are exempt from all style rules (filler words, length
                caps, etc.).
                <br />
                - If the user says no, let user know you will note this down and
                have your manager follow-up with them later.
                <br />
                <br />
                ### Escalate When:
                <br />
                - User asks a question that you do not have the answer to in the
                knowledge base.
                <br />
                - User asks to speak with a manager.
                <br />- User asks for a discount beyond 10% off.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      )}

      <Typography sx={{ mt: 2 }}>
        <b>Step {selectedTool === 0 ? "4" : "3"}.</b> Configure the channel your
        agent will use to contact a human.
      </Typography>
    </Box>
  );
}

function CodeBlock({ text, optional = false }: { text: string; optional?: boolean }) {
  return (
    <Box sx={{
      whiteSpace: "nowrap",
      overflowX: "auto",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}>
        {optional &&<Typography>
           (Optional)
        </Typography>}
        <Typography sx={{ lineHeight: 2 }} fontFamily="monospace" variant="soft">{text}</Typography>
    </Box>
  )
}

function ContactHumanExamples() {
  const [contactHumanExample, setContactHumanExample] = useState("n8n");

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Object.entries(mapContactHumanExamples).map(([key, img]) => (
          <Box
            key={key}
            onClick={() => setContactHumanExample(key)}
            sx={{
              cursor: 'pointer',
              border: contactHumanExample === key ? '2px solid blue' : '1px solid silver',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <img src={img} style={{ width: 80, height: 50, objectFit: 'cover' }} />
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>{key}</Typography>
          </Box>
        ))}
      </Box>

      {contactHumanExample && (
        <img
          src={mapContactHumanExamples[contactHumanExample as keyof typeof mapContactHumanExamples]}
          style={{ width: '100%', maxWidth: 400, border: '1px solid silver' }}
        />
      )}
    </>
  );
}

function ToolApprovalExamples() {
  const [toolApprovalExample, setToolApprovalExample] = useState("retell");

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Object.entries(mapToolApprovalExamples).map(([key, img]) => (
          <Box
            key={key}
            onClick={() => setToolApprovalExample(key)}
            sx={{
              cursor: 'pointer',
              border: toolApprovalExample === key ? '2px solid blue' : '1px solid silver',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <img src={img} style={{ width: 80, height: 50, objectFit: 'cover' }} />
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>{key}</Typography>
          </Box>
        ))}
      </Box>

      {toolApprovalExample && (
        <img
          src={mapToolApprovalExamples[toolApprovalExample as keyof typeof mapToolApprovalExamples]}
          style={{ width: '100%', maxWidth: 400, border: '1px solid silver' }}
        />
      )}
    </>
  );
}