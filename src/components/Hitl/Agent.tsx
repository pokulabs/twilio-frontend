import { useEffect, useState } from "react";
import {
  Typography,
  Textarea,
  Box,
  Table,
  Button,
  Switch,
  Sheet,
  Stack,
  IconButton,
} from "@mui/joy";
import { Delete } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import type { MessageDirection } from "../../types";

export default function DecisionAgent() {
  const [agents, setAgents] = useState<
    { id: string; prompt: string; messageDirection: MessageDirection }[]
  >([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [newDirection, setNewDirection] = useState<MessageDirection>("inbound");

  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient.getAgents();
      setAgents(res.data.data);
    };

    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    await apiClient.deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreate = async () => {
    if (!newPrompt.trim()) return;
    const res = await apiClient.createAgent({
      prompt: newPrompt,
      messageDirection: newDirection,
    });
    setAgents((prev) => [...prev, res.data]);
    setNewPrompt("");
  };

  return (
    <Box>
      <Typography level="h4" gutterBottom>
        Decision Agents
      </Typography>

      {agents.length > 0 && (
        <Sheet variant="outlined" sx={{ mb: 3 }}>
          <Table
            noWrap
            sx={{
              "& thead th:nth-of-type(1)": { width: "60%" },
              "& tr td:last-child": { textAlign: "right" },
            }}
          >
            <thead>
              <tr>
                <th>Prompt</th>
                <th>Direction</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.prompt}</td>
                  <td>
                    {agent.messageDirection === "inbound" ? "→ In" : "Out →"}
                  </td>
                  <td>
                    <IconButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(agent.id)}
                    >
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      )}

      <Stack spacing={2}>
        I want to flag messages that:
        <Textarea
          minRows={3}
          placeholder="Contain financial advice or information."
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
        />
        <Box sx={{ justifyContent: "start" }}>
          <Switch
            startDecorator="Inbound"
            endDecorator="Outbound"
            color="success"
            checked={newDirection === "outbound"}
            onChange={(e) =>
              setNewDirection(e.target.checked ? "outbound" : "inbound")
            }
          />
        </Box>
        <Button onClick={handleCreate} disabled={!newPrompt}>
          Add Agent
        </Button>
      </Stack>
    </Box>
  );
}
