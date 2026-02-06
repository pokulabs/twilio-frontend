import { IconButton, Stack, Typography, Input, Divider } from "@mui/joy";
import { ArrowBackIosNewRounded } from "@mui/icons-material";

import { toggleMessagesPane } from "../../utils";
import { HumanNumberInput } from "../Hitl/Mediums/HumanNumberInput";

type MessagesPaneHeaderProps = {
  activeNumber: string;
  setContactNumber: (contactNumber: string) => void;
};

export default function NewMessagePaneHeader(props: MessagesPaneHeaderProps) {
  const { activeNumber, setContactNumber } = props;
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        py: { xs: 2, md: 2 },
        px: { xs: 1, md: 2 },
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.body",
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 2 }}
        sx={{ alignItems: "center" }}
      >
        <IconButton
          variant="plain"
          color="neutral"
          size="sm"
          sx={{ display: { xs: "inline-flex", sm: "none" } }}
          onClick={() => toggleMessagesPane()}
        >
          <ArrowBackIosNewRounded />
        </IconButton>
        <Typography level="body-md" sx={{ p: 1 }}>
          <b>From:</b> {activeNumber}
        </Typography>
        <Typography level="body-md">
          <b>To:</b>
        </Typography>
        <HumanNumberInput onChange={setContactNumber} />
      </Stack>
    </Stack>
  );
}
