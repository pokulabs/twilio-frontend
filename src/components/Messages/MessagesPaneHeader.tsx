import { useEffect, useState } from "react";
import {
  Avatar,
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
  AutoAwesome,
  InfoOutlined,
  SportsMartialArtsRounded,
} from "@mui/icons-material";
import { Link as RLink } from "react-router-dom";

import { toggleMessagesPane } from "../../utils";

import type { ChatInfo } from "../../types";
import { apiClient } from "../../api-client";
import { useAuth } from "../../hooks/use-auth";

type MessagesPaneHeaderProps = {
  chat: ChatInfo;
};

export default function MessagesPaneHeader(props: MessagesPaneHeaderProps) {
  const { chat } = props;

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
      <Toggle chat={chat} />
    </Stack>
  );
}

type ToggleProps = {
  chat: ChatInfo;
};

function Toggle({ chat }: ToggleProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchData = async () => {
      try {
        const res = await apiClient.getToggle(chat.chatId);
        setIsDisabled(res.data.isDisabled);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [chat.chatId]);

  return (
    <Stack spacing={1} direction="row">
      <Switch
        disabled={!isAuthenticated}
        color={isDisabled ? "warning" : "primary"}
        startDecorator={
          <SportsMartialArtsRounded
            color={isDisabled ? "warning" : "inherit"}
          />
        }
        endDecorator={
          <AutoAwesome color={isDisabled ? "inherit" : "primary"} />
        }
        checked={!isDisabled}
        onChange={(e) => {
          if (!isAuthenticated) {
            return;
          }

          const isChecked = e.target.checked;
          apiClient
            .setToggle(chat.chatId, !isChecked)
            .then(() => {
              setIsDisabled(!isChecked);
            })
            .catch((err) => console.error(err));
        }}
      />
      <Tooltip
        sx={{ maxWidth: 400 }}
        enterTouchDelay={0}
        leaveDelay={100}
        leaveTouchDelay={10000}
        variant="outlined"
        placement="bottom"
        arrow
        title={
          <Typography color="neutral">
            If you have an AI agent that uses Poku, use this toggle to switch
            between <Typography color="primary">AI mode</Typography> and{" "}
            <Typography color="warning">human intervention mode</Typography>.
            <br />
            {!isAuthenticated && (
              <>
                Must be{" "}
                <RLink
                  to="/login"
                >
                  logged in
                </RLink>{" "}
                to use <br />
              </>
            )}
            Learn more{" "}
            <Link
              href="https://docs.google.com/presentation/d/1PMpEqUr7KLtKtcKFnwFGmj_yTf4-D3BwpWkIU9AmiJs/edit?slide=id.g36abfac4763_0_100#slide=id.g36abfac4763_0_100"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </Link>
            .
          </Typography>
        }
      >
        <IconButton>
          <InfoOutlined />
        </IconButton>
      </Tooltip>
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
        Review required
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
              This chat was flagged for review
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
