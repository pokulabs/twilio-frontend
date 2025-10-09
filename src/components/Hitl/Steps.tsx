import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import { Link } from "react-router-dom";
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
  console.log(selectedTool)

  return (
    <div>
      <div className="mb-2">
        <b>Step 1.</b> Choose a human-in-the-loop feature
      </div>

      <div >
        <ToggleGroup 
          type="single" 
          value={selectedTool.toString()} 
          onValueChange={(value) => {if(value) setSelectedTool(+value)}}
          className="w-full rounded-lg bg-gray-100 p-1"
          >
          {[
            {
              value: 0,
              label: "contact_human",
            },
            {value: 1,
              label: "tool_approval",
            }
          ].map((item) => (
            <ToggleGroupItem key={item.value} value={item.value.toString()}
              className="cursor-pointer rounded-lg text-base text-center transition-all data-[state=on]:bg-white data-[state=on]:text-lg data-[state=on]:text-gray-900 data-[state=on]:shadow-sm data-[state=off]:bg-gray-100 data-[state=off]:text-gray-700"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {selectedTool === 0 ? (
        <div  className="">
          Enable your agent to ask a human for help in real-time. The agent
          continues the conversation after input from a human.
        </div>
      ) : (
        <div >
          Require human approval before executing an MCP tool call.
        </div>
      )}

      {selectedTool === 0 ? (

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">

            <AccordionTrigger className="text-md cursor-pointer hover:bg-muted py-2">
              <div>
                <b >Step 2.</b> Connect your agent to the Poku MCP server.
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-0 mb-7 text-base leading-9">
              <div>
                <b>2.1</b> Go to the{" "}
                <Link to="/" className="text-blue-500">
                  Account
                </Link>{" "}
                page to generate your Poku API key.
              </div>

              <div >
                <b>2.2</b> Navigate to your agent and create a MCP connection
              </div>

              <ContactHumanExamples />

              <div >
                <strong>Server URL (Streamable):</strong>{" "}
              </div>
              <code className="block bg-muted text-sm font-mono p-2 rounded-md">
                https://mcp.pokulabs.com
              </code>
              <div >
                <strong>Server URL (SSE):</strong>{" "}
              </div>
              <code className="block bg-muted text-sm font-mono p-2 rounded-md">
                https://mcp.pokulabs.com/sse
              </code>
              <div >
                <strong>Timeout:</strong>
                <br />
                60 sec (use same value as Wait Time in Step 4)
              </div>
              <div>
                <strong>Headers:</strong>{" "}
              </div>
              <code className="block bg-muted text-sm font-mono p-2 rounded-md">
                Authorization: Bearer &lt;YOUR_POKU_KEY&gt;
              </code>
              <div ></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      ) : (
        
        <Accordion type="single" collapsible>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-md hover:bg-muted cursor-pointer py-2">
              <div>
                <b>Step 2.</b> Connect your agent to the Poku MCP Proxy server.
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-0 mb-7 text-base leading-9">
              <div>
                <b>2.1</b> Go to the{" "}
                <Link to="/" className="text-blue-500">
                  Account
                </Link>{" "}
                page to generate your Poku API key.
              </div>

              <div >
                <b>2.2</b> Navigate to your agent and create a MCP connection
              </div>

              {/* <img
                src={n8nImg}
                style={{
                  width: "100%",
                  maxWidth: 400,
                  border: "1px solid silver",
                  }}
                  /> */}

              <div>
                <strong>Server URL (Streamable):</strong>{" "}
              </div>
              <code className="block bg-muted text-sm font-mono py-2 rounded-md">
                https://mcp-proxy.pokulabs.com?url=&lt;YOUR_MCP_URL&gt;
              </code>
              <div>
                Replace <code className="font-mono bg-muted">{"<YOUR_MCP_URL>"}</code> with the url of the MCP
                server you want to gate with human approval.
              </div>
              <div >
                <strong>Timeout:</strong>
                <br />
                60 sec (use same value as Wait Time in Step 4)
              </div>
              <div >
                <strong>Headers:</strong>{" "}
              </div>
              <code className="block bg-muted text-sm font-mono py-2 rounded-md">
                Poku-Authorization: Bearer &lt;YOUR_POKU_KEY&gt;
              </code>
              <div ></div>
              <code className="block bg-muted text-sm font-mono py-2 my-2 rounded-md">
                Authorization: Bearer &lt;YOUR_MCP_AUTH_KEY&gt;
              </code>
              <div ></div>
              <ToolApprovalExamples />

              <div >
                <b>2.3</b> Select the tool(s) you want to gate with human
                approval.
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      )}

      {selectedTool === 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-3">
            <AccordionTrigger className="cursor-pointer hover:bg-muted text-md py-0 items-center">
              <div className="py-0">
                <b>Step 3.</b> Update your AI agent prompt to use the{" "}
                <code>contact_human</code> tool.
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="mb-1 text-base">
                <b>Sample prompt 1:</b>
                <br />
              </div>
              <div className="mb-3 text-gray-500">
                When you encounter a question that's outside the scope of the
                knowledge base, immediately use the <b>contact_human</b> tool to
                request help from a manager.
              </div>

              <div className="mb-1 text-base">
                <b>Sample prompt 2:</b>
              </div>
              <div className="text-gray-500">
                ## Tool
                <br />
                0. If you need manager input (see “Escalate When” list) you MUST
                <br />
                - first get user consent to be put on hold by asking "Is it ok
                if I put you on a brief hold while I check with my manager?"
                <br />- if user says yes, use <b>contact_human</b> tool.
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
   
      )}

      <div >
        <b>Step {selectedTool === 0 ? "4" : "3"}.</b> Configure the channel your
        agent will use to contact a human.
      </div>
    </div>
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
    <div
      className="whitespace-nowrap overflow-x-auto flex items-center gap-1"
    >
      {optional && <div>(Optional)</div>}
      <div>
        {text}
      </div>
    </div>
  );
}

function ContactHumanExamples() {
  const [contactHumanExample, setContactHumanExample] = useState("n8n");

  return (
    <>
      <div className="flex gap-2 mb-2">
        {Object.entries(mapContactHumanExamples).map(([key, img]) => (
          <div
            key={key}
            onClick={() => setContactHumanExample(key)}
            className={`cursor-pointer rounded-sm ${contactHumanExample === key ? "border-2 border-blue-700" : "border-1 border-silver-400"} overflow-hidden `}
          >
            <img
              src={img}
              style={{ width: 80, height: 50, objectFit: "cover" }}
            />
            <div className="text-center text-sm">
              {key}
            </div>
          </div>
        ))}
      </div>

      {contactHumanExample && (
        <img
          src={
            mapContactHumanExamples[
              contactHumanExample as keyof typeof mapContactHumanExamples
            ]
          }
          style={{ width: "100%", maxWidth: 400, border: "1px solid silver" }}
        />
      )}
    </>
  );
}

function ToolApprovalExamples() {
  const [toolApprovalExample, setToolApprovalExample] = useState("retell");

  return (
    <>
      <div className="flex gap-2 mb-2">
        {Object.entries(mapToolApprovalExamples).map(([key, img]) => (
          <div
            key={key}
            onClick={() => setToolApprovalExample(key)}
            className={`cursor-pointer rounded-sm ${toolApprovalExample === key ? "border-2 border-blue-700" : "border-1 border silver-400"} overflow-hidden`}
          >
            <img
              src={img}
              style={{ width: 80, height: 50, objectFit: "cover" }}
            />
            <div className="text-center">
              {key}
            </div>
          </div>
        ))}
      </div>

      {toolApprovalExample && (
        <img
          src={
            mapToolApprovalExamples[
              toolApprovalExample as keyof typeof mapToolApprovalExamples
            ]
          }
          style={{ width: "100%", maxWidth: 400, border: "1px solid silver" }}
        />
      )}
    </>
  );
}
