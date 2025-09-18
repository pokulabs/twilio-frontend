import * as React from "react";
import { Box, Button, FormControl, Textarea, Stack } from "@mui/joy";
import { SendRounded } from "@mui/icons-material";

export type MessageInputProps = {
  disabled?: boolean;
  onSubmit: (content: string) => Promise<void>;
};

export default function MessageInput(props: MessageInputProps) {
  const [textAreaValue, setTextAreaValue] = React.useState("");
  const { onSubmit, disabled } = props;
  const textAreaRef = React.useRef<HTMLDivElement>(null);
  const handleClick = () => {
    if (textAreaValue.trim() !== "") {
      void onSubmit(textAreaValue);
      setTextAreaValue("");
    }
  };
  return (
    <Box sx={{ px: 2, pb: 3, pt: 3 }}>
      <FormControl>
        <Stack spacing={1} direction="row">
          <Textarea
            sx={{
              flexGrow: 1,
            }}
            placeholder="Enter your message..."
            aria-label="Message"
            ref={textAreaRef}
            onChange={(event) => {
              setTextAreaValue(event.target.value);
            }}
            value={textAreaValue}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                handleClick();
              }
            }}
            disabled={disabled}
          />
          <Button
            size="sm"
            color="primary"
            sx={{ alignSelf: "center", borderRadius: "sm" }}
            endDecorator={<SendRounded />}
            onClick={handleClick}
            disabled={!textAreaValue.trim()}
          >
            Send
          </Button>
        </Stack>
      </FormControl>
    </Box>
  );
}
