import { useState } from "react";
import {
  Button,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { apiClient } from "../../api-client";
import { useAuth } from "../../hooks/use-auth";
import { ChatInfo } from "../../types";

export default function AssignModal(props: {
  open: boolean;
  onClose: () => void;
  chat: ChatInfo;
}) {
  const { orgMembers, isOrgAdmin, userEmail, userId } = useAuth();

  const [assignee, setAssignee] = useState<string | null>(null);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "clamp(320px, 92vw, 800px)",
          borderRadius: "md",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Typography component="h2" level="h4" sx={{ fontWeight: "lg" }}>
            Assign Chat to User
          </Typography>

          <Select
            placeholder="Select user"
            value={assignee}
            onChange={(_event, newAssignee) => {
              setAssignee(newAssignee!);
            }}
          >
            {orgMembers.map((e) => {
              return (
                <Option key={e.id} value={e.id}>
                  {e.email}
                </Option>
              );
            })}
          </Select>

          <Button
            disabled={!assignee}
            onClick={async () => {
              await apiClient.assignChat(props.chat.chatId, assignee!);
              props.onClose();
            }}
          >
            Assign
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
}
