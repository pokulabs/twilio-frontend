import { Box, Button, Input } from "@mui/joy";
import { useAuth } from "../../hooks/use-auth";
import { useState } from "react";

function Admin() {
  const { isAdmin } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <ImpersonateField isAdmin={isAdmin} />
    </Box>
  );
}

export default Admin;

function ImpersonateField({ isAdmin }: { isAdmin: boolean }) {
  const { impersonateUser } = useAuth();

  const [userId, setUserId] = useState("");

  const handleImpersonate = () => {
    if (!userId) return;
    impersonateUser(userId);
  };

  return (
    isAdmin && (
      <Input
        placeholder="Enter user ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        endDecorator={<Button onClick={handleImpersonate}>Impersonate</Button>}
      />
    )
  );
}
