import { Box, Button, Input } from "@mui/joy";
import { useAuth } from "../../hooks/use-auth";
import { useState } from "react";
import withLoggedIn from "../../context/withLoggedIn";

function Admin() {
  const { isAdmin } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 5,
        flexDirection: "column",
        p: 4,
        width: "100%",
        maxWidth: 900,
        gap: 3,
      }}
    >
      <ImpersonateField isAdmin={isAdmin} />
    </Box>
  );
}

export default withLoggedIn(Admin);

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
