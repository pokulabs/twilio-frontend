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
import retellFuncImg from "../../assets/retell-contact-human-function.png";
import retellParamsImg from "../../assets/retell-parameters.png";
import retellToolImg from "../../assets/retell-tool-approval.png";

export default function Steps() {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [selectedTool, setSelectedTool] = useState(0);

  return (
    <Box>
      <Typography sx={{ mb: 1 }}>
        <b>Step 1.</b> What platform is your AI agent hosted on?
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <RadioGroup
          orientation="horizontal"
          value={selectedPlatform}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedPlatform(+event.target.value);
            setSelectedTool(0);
          }}
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
              }}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Step 2 - Conditionally rendered based on tab */}
      {selectedPlatform === 0 ? (
        <>
          <Typography sx={{ mt: 1, mb: 1 }}>
            Which tool are you interested in?
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
              continues the conversation seamlessly after input from a human.
            </Typography>
          ) : (
            <Typography level="body-sm" sx={{ mt: 1 }}>
              Enable your agent to require human approval before executing a
              custom tool call.
            </Typography>
          )}

          {selectedTool === 0 ? (
            <AccordionGroup>
              <Accordion sx={{ mt: 1, p: 0 }}>
                <AccordionSummary sx={{ fontWeight: "normal" }}>
                  <Box>
                    <b>Step 2.</b> Create a custom function for your Retell
                    agent.
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
                    <b>2.2</b> Navigate to your agent and create a new custom
                    function.
                  </Typography>

                  <img
                    src={retellFuncImg}
                    style={{
                      width: "100%",
                      maxWidth: 500,
                      marginBottom: 16,
                      marginTop: 10,
                      border: "1px solid silver",
                    }}
                  />
                  <Typography>
                    <strong>Name:</strong> <code>contact_human</code>
                    <br />
                    <strong>API Endpoint:</strong>{" "}
                    <code>POST https://api.pokulabs.com/hitl</code>
                    <br />
                    <strong>Timeout:</strong> 60 sec (use same value as Wait
                    Time in Step 4)
                    <br />
                    <strong>Headers:</strong>{" "}
                    <code>Authorization: Bearer YOUR_POKU_KEY</code>
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    <strong>Parameters:</strong>
                    <br />
                    <code>message:</code> agent's message to human.
                    <br />
                    <code>context:</code> additional conversation context not
                    mentioned in "message" to help the human catch up.
                  </Typography>
                  <img
                    src={retellParamsImg}
                    style={{
                      width: "100%",
                      maxWidth: 500,
                      marginTop: 10,
                      border: "1px solid silver",
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            </AccordionGroup>
          ) : (
            <AccordionGroup>
              <Accordion sx={{ mt: 1, p: 0 }}>
                <AccordionSummary sx={{ fontWeight: "normal" }}>
                  <Box>
                    <b>Step 2.</b> Modify your custom function to require human
                    approval before executing.
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
                    <b>2.2</b> Navigate to your agent and choose a custom
                    function to modify.
                  </Typography>

                  <img
                    src={retellToolImg}
                    style={{
                      width: "100%",
                      maxWidth: 500,
                      marginBottom: 16,
                      marginTop: 10,
                      border: "1px solid silver",
                    }}
                  />
                  <Typography>
                    <strong>API Endpoint:</strong>{" "}
                    <code>POST https://api.pokulabs.com/tool-approval</code>
                    <br />
                    <strong>Timeout:</strong> 60 sec (use same value as Wait
                    Time in Step 3)
                    <br />
                    <strong>Headers:</strong>{" "}
                    <code>Poku-Authorization: Bearer YOUR_POKU_KEY</code>
                    <br />
                    <strong>Query params:</strong>{" "}
                    <code>url: ORIGINAL_FUNCTION_URL</code>
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </AccordionGroup>
          )}
        </>
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

              <Typography sx={{ mb: 1 }}>
                <b>2.2</b> Navigate to your agent and add a new tool to create a
                MCP connection
              </Typography>

              <img
                src={n8nImg}
                style={{
                  width: "100%",
                  maxWidth: 400,
                  border: "1px solid silver",
                }}
              />

              <Typography sx={{ mt: 1 }}>
                <strong>Server URL (Streamable):</strong>{" "}
                <code>https://mcp.pokulabs.com</code>
                <br />
                <strong>Server URL (SSE):</strong>{" "}
                <code>https://mcp.pokulabs.com/sse</code>
                <br />
                <strong>Timeout:</strong> 60 sec (use same value as Wait Time in
                Step 4)
                <br />
                <strong>Headers:</strong>{" "}
                <code>Authorization: Bearer YOUR_POKU_KEY</code>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      )}

      {/* Step 3 - Shared across both options */}
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
                knowledge base, immediately use the contact_human tool to
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
                - if user says yes, use contact_human tool.
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
        <b>Step {selectedTool === 0 ? "4" : "3"}.</b> Provide the numbers your
        agent will reach out to and from when it contacts a human. Configure
        below.
      </Typography>
    </Box>
  );
}
