import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Input,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import type { ChatInfo } from "../../types";
import { apiClient } from "../../api-client";

type LabelInfo = { id: string; name: string; color: string };
const COLOR_CHOICES = [
  { name: "Red", color: "#FF3B30" },
  { name: "Orange", color: "#FF9500" },
  { name: "Yellow", color: "#FFCC00" },
  { name: "Green", color: "#34C759" },
  { name: "Blue", color: "#007AFF" },
  { name: "Purple", color: "#AF52DE" },
  { name: "Gray", color: "#8E8E93" },
];

export default function NotesLabelsModal(props: {
  open: boolean;
  onClose: () => void;
  chat: ChatInfo;
}) {
  const { open, onClose, chat } = props;
  const [notes, setNotes] = useState<string>("");
  const [initialNotes, setInitialNotes] = useState<string>("");
  // Labels state (assigned + catalog)
  const [assignedLabels, setAssignedLabels] = useState<LabelInfo[]>([]);
  const [allLabels, setAllLabels] = useState<LabelInfo[]>([]);
  const [existingLabelId, setExistingLabelId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [labelBusy, setLabelBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!open) return;
    setLoading(true);
    // Fetch notes
    apiClient
      .getChatNotes(chat.chatId)
      .then((res) => {
        if (!active) return;
        const serverNotes = res?.data?.notes ?? "";
        setNotes(serverNotes);
        setInitialNotes(serverNotes);
      })
      .catch(() => {
        if (!active) return;
        setNotes("");
        setInitialNotes("");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Fetch labels (assigned to this chat) and all user labels
    apiClient
      .getChatLabels(chat.chatId)
      .then((res) => {
        if (!active) return;
        setAssignedLabels(res?.data?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setAssignedLabels([]);
      });
    apiClient
      .listUserLabels()
      .then((res) => {
        if (!active) return;
        setAllLabels(res?.data?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setAllLabels([]);
      });
    return () => {
      active = false;
    };
  }, [open, chat.chatId]);

  // Save/Reset only track notes; label actions apply immediately
  const isDirty = notes !== initialNotes;

  const assignedIds = new Set(assignedLabels.map((l) => l.id));
  const availableLabels = allLabels.filter((l) => !assignedIds.has(l.id));

  const colorNameFromHex = (hex: string) =>
    COLOR_CHOICES.find((c) => c.color === hex)?.name ?? "Label";

  const refreshAssigned = async () => {
    const res = await apiClient.getChatLabels(chat.chatId);
    setAssignedLabels(res?.data?.data ?? []);
  };

  const handleApplyLabel = async () => {
    if (!existingLabelId && !selectedColor) return;
    setLabelBusy(true);
    try {
      if (existingLabelId) {
        await apiClient.assignLabelToChat(chat.chatId, existingLabelId);
      } else if (selectedColor) {
        const name = newLabelName.trim() || colorNameFromHex(selectedColor);
        await apiClient.assignLabelByName(chat.chatId, name, selectedColor);
      }
      await refreshAssigned();
      setExistingLabelId(null);
      setNewLabelName("");
      setSelectedColor(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLabelBusy(false);
    }
  };

  const handleUnassign = async (labelId: string) => {
    setLabelBusy(true);
    try {
      await apiClient.unassignLabelFromChat(chat.chatId, labelId);
      await refreshAssigned();
    } catch (err) {
      console.error(err);
    } finally {
      setLabelBusy(false);
    }
  };

  // Mutually-exclusive UX between selecting existing vs creating new
  const isUsingExisting = !!existingLabelId;
  const hasName = newLabelName.trim().length > 0;
  const disableCreateFields = isUsingExisting; // when selecting existing, lock name + colors
  const disableExistingSelect = hasName || !!selectedColor; // when creating new (typed or color picked), lock dropdown

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "clamp(320px, 92vw, 800px)",
          maxWidth: "100vw",
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Typography component="h2" level="h4" sx={{ fontWeight: "lg" }}>
            Notes & Labels
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ flex: 1, minHeight: 0, alignItems: "stretch" }}
          >
            <Stack sx={{ flex: 2, minWidth: 0, minHeight: 0 }} spacing={1.25}>
              {chat.enrichedData?.displayName && (
                <Stack spacing={0.5}>
                  <Typography>{chat.enrichedData.displayName}</Typography>
                </Stack>
              )}
              {chat.enrichedData?.card && (
                <Stack spacing={0.5}>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {chat.enrichedData.card}
                  </Typography>
                </Stack>
              )}
              <Stack spacing={0.5} sx={{ flex: 1, minHeight: 0 }}>
                <Textarea
                  minRows={4}
                  placeholder={loading ? "Loading..." : "Add notes about this contact"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    height: "100%",
                    "--Textarea-minHeight": 0,
                    "& textarea": { height: "100%" },
                  }}
                />
              </Stack>
            </Stack>
            <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }} spacing={1.25}>
              {/* Assigned labels (hide when none) */}
              {assignedLabels.length > 0 && (
                <Stack spacing={0.75}>
                  <Typography level="body-sm" textColor="text.tertiary">
                    Assigned Labels
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {assignedLabels.map((label) => (
                      <Chip
                        key={label.id}
                        variant="soft"
                        sx={{
                          borderColor: label.color,
                          color: "var(--joy-palette-text-primary)",
                          bgcolor: `${label.color}20`,
                        }}
                        startDecorator={<Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: label.color }} />}
                        endDecorator={
                          <Box sx={{ pointerEvents: "auto" }}>
                            <IconButton
                              size="sm"
                              variant="plain"
                              type="button"
                              aria-label={`Unassign ${label.name}`}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassign(label.id);
                              }}
                              disabled={labelBusy}
                              sx={{
                                cursor: "pointer",
                                bgcolor: "transparent",
                                "&:hover": { bgcolor: "transparent" },
                                "&:active": { bgcolor: "transparent" },
                                "&:focusVisible": {
                                  outline: "none",
                                  boxShadow: "none",
                                  bgcolor: "transparent",
                                },
                              }}
                            >
                              ×
                            </IconButton>
                          </Box>
                        }
                      >
                        {label.name}
                      </Chip>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Apply an existing label (excluding already assigned) */}
              <Stack spacing={0.75}>
                <Typography level="body-sm" textColor="text.tertiary">
                  Apply existing label
                </Typography>
                <Select
                  placeholder="Select a label"
                  value={existingLabelId}
                  onChange={(_, v) => setExistingLabelId(v ? (v as string) : null)}
                  disabled={disableExistingSelect}
                >
                  <Option value="">Select a label</Option>
                  {availableLabels.map((l) => (
                    <Option key={l.id} value={l.id}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: l.color }} />
                      {l.name}
                    </Option>
                  ))}
                </Select>
              </Stack>

              {/* Or create new */}
              <Stack spacing={0.75}>
                <Typography level="body-sm" textColor="text.tertiary">
                  Or create new
                </Typography>
                <Input
                  placeholder="Label name (optional)"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  disabled={disableCreateFields}
                />
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {COLOR_CHOICES.map((c) => (
                    <IconButton
                      key={c.color}
                      variant={selectedColor === c.color ? "soft" : "plain"}
                      onClick={() => setSelectedColor(c.color)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        p: 0,
                        border: selectedColor === c.color ? `2px solid ${c.color}` : "2px solid transparent",
                        bgcolor: "transparent",
                      }}
                      disabled={disableCreateFields}
                    >
                      <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: c.color }} />
                    </IconButton>
                  ))}
                </Stack>
                <Button
                  size="sm"
                  onClick={handleApplyLabel}
                  disabled={labelBusy || (!existingLabelId && !selectedColor)}
                  sx={{
                    bgcolor: "#f15d43",
                    color: "#fff",
                    "&:hover": { bgcolor: "#d84f39" },
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1.5}
            sx={{ mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider" }}
          >
            <Button
              variant="solid"
              disabled={!isDirty || saving || loading}
              sx={{
                bgcolor: "#f5a449",
                color: "#fff",
                "&:hover": { bgcolor: "#e39433" },
              }}
              onClick={() => {
                setNotes(initialNotes);
                // labels apply immediately; no reset needed here
              }}
            >
              Reset
            </Button>
            <Button
              variant="solid"
              loading={saving}
              disabled={!isDirty || loading}
              sx={{
                bgcolor: "#f15d43",
                color: "#fff",
                "&:hover": { bgcolor: "#d84f39" },
              }}
              onClick={async () => {
                try {
                  setSaving(true);
                  await apiClient.saveChatNotes(chat.chatId, notes);
                  // Update the initial snapshot so buttons become disabled after save in-session
                  setInitialNotes(notes);
                  onClose();
                } catch (err) {
                  console.error(err);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Sheet>
    </Modal>
  );
}
