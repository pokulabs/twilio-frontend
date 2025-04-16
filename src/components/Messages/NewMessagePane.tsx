import * as React from "react";
import { Box, Sheet } from "@mui/joy";

import MessageInput from "./MessageInput";
import { useAuthedCreds } from "../../context/CredentialsContext";
import NewMessagePaneHeader from "./NewMessagePaneHeader";

export default function NewMessagesPane(props: {
  activePhoneNumber: string;
  callback: (contactNumber: string) => void;
}) {
  const { activePhoneNumber, callback } = props;
  const [contactNumber, setContactNumber] = React.useState("");
  const { twilioClient } = useAuthedCreds();

  return (
    <Sheet
      sx={{
        height: { xs: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.level1",
      }}
    >
      <NewMessagePaneHeader setContactNumber={setContactNumber} />
      <Box sx={{ mt: "auto" }}>
        <MessageInput
          onSubmit={async (content) => {
            await twilioClient.sendMessage(
              activePhoneNumber,
              contactNumber,
              content,
            );
            callback(contactNumber);
          }}
        />
      </Box>
    </Sheet>
  );
}
