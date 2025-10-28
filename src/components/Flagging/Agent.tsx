import { useEffect, useState } from "react";
import {
  Typography,
  Textarea,
  Box,
  Table,
  Button,
  Sheet,
  Stack,
  IconButton,
  Select,
  Option,
} from "@mui/joy";
import { Delete } from "@mui/icons-material";
import { apiClient } from "../../api-client";
import type { MessageDirection } from "../../types/types";

export default function DecisionAgent(props: { hasLlmKey: boolean }) {
  const { hasLlmKey } = props;
  const [agents, setAgents] = useState<
    { id: string; prompt: string; messageDirection: MessageDirection }[]
  >([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [newDirection, setNewDirection] = useState<MessageDirection>("inbound");

  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient.getAgents();
      if (res.data) {
        setAgents(res.data.data);
      }
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
        Flagging Rules
      </Typography>

      {agents.length > 0 && (
        <Sheet variant="outlined" sx={{ mb: 3 }}>
          <Table
            noWrap
            sx={{
              "& thead th:nth-of-type(1)": { width: "60%" },
              "& thead th:nth-of-type(2)": { width: "25%" },
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
                  <td title={agent.prompt}>{agent.prompt}</td>
                  <td>
                    {agent.messageDirection === "inbound"
                      ? "→ inbound"
                      : "outbound →"}
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

      <Stack spacing={1}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography level="body-md">I want to flag</Typography>
          <Select
            value={newDirection}
            onChange={(_event, direction) => setNewDirection(direction!)}
          >
            <Option value="inbound">inbound</Option>
            <Option value="outbound">outbound</Option>
          </Select>
          <Typography level="body-md">messages that:</Typography>
        </Box>

        <Textarea
          minRows={3}
          placeholder="ask to speak to a human or staff member."
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={!newPrompt || !hasLlmKey}>
          Add Rule
        </Button>
      </Stack>
    </Box>
  );
}
