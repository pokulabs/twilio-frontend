import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  ArrowBackIosNewRounded,
  CloseRounded,
  InfoOutlined,
} from "@mui/icons-material";

import { DOCS_LINK, toggleMessagesPane } from "../../utils";

import type { ChatInfo } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api-client";

type MessagesPaneHeaderProps = {
  chat: ChatInfo;
};

export default function MessagesPaneHeader(props: MessagesPaneHeaderProps) {
  const { chat } = props;
  const [isInfoShown, setIsInfoShown] = useState(false);
  const navigate = useNavigate();

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
      <Stack direction="column" sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack
            direction="row"
            sx={{ alignItems: "center" }}
            spacing={{ xs: 1, md: 2 }}
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
            <Avatar size="lg" />
            <Typography
              component="h2"
              noWrap
              sx={{ fontWeight: "lg", fontSize: "lg" }}
            >
              {chat.contactNumber}
            </Typography>
            {chat.isFlagged && (
              <Resolve
                chatId={chat.chatId}
                reason={chat.flaggedReason}
                message={chat.flaggedMessage}
              />
            )}
          </Stack>
          <Toggle
            chat={chat}
            isInfoShown={isInfoShown}
            setIsInfoShown={setIsInfoShown}
          />
        </Stack>

        {isInfoShown && (
          <Box
            sx={{
              pt: 1,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                maxWidth: "100%", // optional safeguard
              }}
            >
              <Alert
                variant="soft"
                color="neutral"
                endDecorator={
                  <IconButton
                    variant="soft"
                    color="neutral"
                    onClick={() => setIsInfoShown(false)}
                  >
                    <CloseRounded />
                  </IconButton>
                }
              >
                <Typography color="neutral">
                  Use this to tell your agent whether to respond to this chat or
                  not. <br />
                  Must be{" "}
                  <Link
                    component="button"
                    onClick={() => {
                      navigate("/account");
                    }}
                  >
                    logged in
                  </Link>{" "}
                  to use.
                  <br />
                  Learn more in our{" "}
                  <Link
                    href={DOCS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    docs
                  </Link>
                  .
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}

type ToggleProps = {
  chat: ChatInfo;
  isInfoShown: boolean;
  setIsInfoShown: (val: boolean) => void;
};

function Toggle({ chat, isInfoShown, setIsInfoShown }: ToggleProps) {
  const [switchValue, setSwitchValue] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    apiClient
      .getToggle(chat.chatId)
      .then((res) => {
        setSwitchValue(res.data.isEnabled);
      })
      .catch((err) => console.error(err));
  }, [chat]);

  return (
    <Stack spacing={1} direction="row">
      <Tooltip title="Use this to tell your agent whether to respond to this chat or not.">
        <Switch
          checked={switchValue}
          onChange={(e) => {
            if (!isAuthenticated) {
              setIsInfoShown(true);
              return;
            }

            const isChecked = e.target.checked;
            apiClient
              .setToggle(chat.chatId, isChecked)
              .then(() => {
                setSwitchValue(isChecked);
              })
              .catch((err) => console.error(err));
          }}
        />
      </Tooltip>
      <IconButton onClick={() => setIsInfoShown(!isInfoShown)}>
        <InfoOutlined />
      </IconButton>
    </Stack>
  );
}

function Resolve(props: {
  chatId: string;
  reason: string | undefined;
  message: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Chip variant="outlined" color="warning" onClick={() => setOpen(true)}>
        Resolve
      </Chip>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{ maxWidth: 500, borderRadius: "md", p: 3, boxShadow: "lg" }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Stack sx={{ gap: 1 }}>
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              sx={{ fontWeight: "lg", mb: 1 }}
            >
              Your Decision Agent flagged this chat for review
            </Typography>
            <Typography textColor="text.tertiary">
              <b>Message received:</b>
              <br />
              {props.message}
            </Typography>
            <Typography textColor="text.tertiary">
              <b>Reason flagged:</b>
              <br />
              {props.reason}
            </Typography>
            <Button
              color="success"
              onClick={() => {
                apiClient
                  .resolveChat(props.chatId)
                  .catch((err) => console.error(err));
                setOpen(false);
              }}
            >
              Resolve
            </Button>
          </Stack>
        </Sheet>
      </Modal>
    </>
  );
}
