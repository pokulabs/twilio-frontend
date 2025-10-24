import { useState } from "react";
import {
  Typography,
  Box,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  Modal,
  Divider,
} from "@mui/joy";
import { Link as RLink } from "react-router-dom";
import n8nImg from "../../assets/n8n-contact-human-mcp.jpeg";
import retellMcpImg from "../../assets/retell-mcp.jpg";
import retellMcpProxyImg from "../../assets/retell-mcp-proxy.png";
import vapiMcpImg from "../../assets/vapi-mcp.jpeg";
import vapiMcpProxyImg from "../../assets/vapi-mcp-proxy.png";
import { ListInteractionChannels } from "./ListInteractionChannels";
import SegmentedRadio from "../shared/SegmentedRadio";

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
    <Box
      sx={{
        maxWidth: 782,
      }}
    >
      <Typography sx={{ mt: 4, mb: 1 }}>
        <b>1.</b> Choose a human-in-the-loop feature
      </Typography>

      <SegmentedRadio
        value={selectedTool}
        onChange={(v) => setSelectedTool(v)}
        options={[
          { value: 0, label: "contact_human" },
          { value: 1, label: "tool_approval" },
        ]}
      />

      {selectedTool === 0 ? (
        <Typography level="body-sm" sx={{ mt: 1 }}>
          Enable your agent to ask a human for help in real-time. The agent
          continues the conversation after input from a human.
        </Typography>
      ) : (
        <Typography level="body-sm" sx={{ mt: 1 }}>
          Require human approval before executing an MCP tool call.
        </Typography>
      )}

      {selectedTool === 0 ? (
        <AccordionGroup>
          <Accordion sx={{ mt: 2, p: 0 }}>
            <AccordionSummary sx={{ fontWeight: "normal" }}>
              <Box>
                <b>2.</b> Connect your agent to the Poku MCP server.
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

              <ExampleLightboxGallery imagesMap={mapContactHumanExamples} />

              <Typography sx={{ mt: 1 }}>
                <strong>Server URL:</strong>
                <br />
                Copy from your channel card below. This URL is specific to the
                channel you have configured.
              </Typography>
              <Typography sx={{ mb: 1, mt: 1 }}>
                <strong>Timeout:</strong>
                <br />
                If your platform allows you to set a timeout, we recommend
                setting the same wait time as what you have configured on your
                interaction channel.
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
                <b>2.</b> Connect your agent to the Poku MCP Proxy server.
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
                Replace <code>{"<YOUR_MCP_URL>"}</code> with the url of the MCP
                server you want to gate with human approval.
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
              <CodeBlock
                text="Authorization: Bearer <YOUR_MCP_AUTH_KEY>"
                optional
              />
              <Typography sx={{ mt: 1 }}></Typography>
              <ExampleLightboxGallery imagesMap={mapToolApprovalExamples} />

              <Typography sx={{ mt: 1 }}>
                <b>2.3</b> Select the tool(s) you want to gate with human
                approval.
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
                <b>3.</b> Update your AI agent prompt to use the{" "}
                <code>contact_human</code> tool.
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ ml: 1 }}>
              <Typography>
                <b>Example 1: </b>
                Agent checks if a manager is available before transferring the
                call
              </Typography>
              <Typography level="body-sm" sx={{ mt: 1, mb: 1 }}>
                # HUMAN_TRANSFER_PROTOCOL
                <br />
                ## Workflow When Customer Requests a Human
                <br />
                **Step 1: Get Consent**
                <br />
                Ask: "Is it ok if I put you on hold for a minute while I check
                if a manager is available? I'll go silent but I'm still on the
                line."
                <br />
                - If customer says NO → continue helping them yourself
                <br />
                - If customer says YES → proceed to Step 3
                <br />
                **Step 2: Check Availability**
                <br />
                Use `contact_human` with context: "Customer requesting human
                manager regarding [their issue]. Are you available?"
                <br />
                <br />
                **Step 3: Act on Response**
                <br />
                - **Manager says YES** → "A manager is available. Transferring
                you now." → Use `transfer_call`
                <br />
                - **Manager says NO** → Share manager's input with customer →
                Continue conversation (no transfer)
                <br />
                - **No response/failure** → "I've left a note for the manager.
                Let me continue helping you." → Continue conversation (no
                transfer)
                <br />
                ## Critical Rules
                <br />- NEVER use `transfer_call` without manager confirmation
                via `contact_human`
              </Typography>

              <Typography>
                <b>Example 2: </b>
                Agent escalates to a human when encountering a question outside
                the knowledge base
              </Typography>
              <Typography level="body-sm" sx={{ mt: 1, mb: 1 }}>
                If the user asks a question that is outside the scope of the
                knowledge base, ask: "Is it ok if I put you on hold for a minute
                while I check with a manager on your question? I'll go silent
                but I'm still on the line."
                <br />
                - If customer says NO → continue helping them yourself
                <br />- If customer says YES → use contact_human tool
              </Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      )}

      <Typography sx={{ mt: 2 }}>
        <b>{selectedTool === 0 ? "4" : "3"}.</b> Configure the channel your
        agent will use to contact a human.
      </Typography>

      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>
      <ListInteractionChannels />
    </Box>
  );
}

function CodeBlock({
  text,
  optional = false,
}: {
  text: string;
  optional?: boolean;
}) {
  return (
    <Box
      sx={{
        whiteSpace: "nowrap",
        overflowX: "auto",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {optional && <Typography>(Optional)</Typography>}
      <Typography sx={{ lineHeight: 2 }} fontFamily="monospace" variant="soft">
        {text}
      </Typography>
    </Box>
  );
}

function ExampleLightboxGallery({
  imagesMap,
}: {
  imagesMap: Record<string, string>;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {Object.entries(imagesMap).map(([key, img]) => (
          <Box
            key={key}
            onClick={() => {
              setSelectedKey(key);
              setOpen(true);
            }}
            sx={{
              cursor: "pointer",
              border: "1px solid silver",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <img
              src={img}
              style={{ width: 80, height: 50, objectFit: "cover" }}
            />
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              {key}
            </Typography>
          </Box>
        ))}
      </Box>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedKey !== null && (
            <img
              src={imagesMap[selectedKey]}
              style={{
                objectFit: "contain",
                maxWidth: "95vw",
                maxHeight: "95vh",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
}
