import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Select,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";

import { formatDurationHumanReadable } from "../../utils";
import type {
  InteractionAddressValue,
  InteractionFormRequest,
  InteractionFormValue,
} from "../../types/backend-frontend";
import AddressAutocompleteField from "./AddressAutocompleteField";
import {
  getValidationChecklist,
  isAddressValue,
  validateField,
} from "./formValidation";

type FormValues = Record<string, InteractionFormValue>;

interface PublicReplyFormProps {
  body?: string;
  form: InteractionFormRequest;
  replyToken: string;
  expiresAt: string;
  now: number;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (values: FormValues) => Promise<void>;
}

export default function PublicReplyForm({
  body,
  form,
  replyToken,
  expiresAt,
  now,
  isSubmitting,
  serverError,
  onSubmit,
}: PublicReplyFormProps) {
  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(
      form.fields.map((field) => [
        field.id,
        field.type === "checkbox"
          ? false
          : field.type === "address"
            ? { text: "", place_id: "" }
            : "",
      ]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - now) / 1000),
  );
  const isExpired = remainingSeconds === 0;

  const statusColor = remainingSeconds > 60 ? "success" : remainingSeconds > 0 ? "warning" : "neutral";
  const statusLabel =
    remainingSeconds > 0
      ? `${formatDurationHumanReadable(remainingSeconds)} left`
      : "Expired";

  const helperText = useMemo(
    () =>
      form.description ??
      "Fill out the fields below and submit your response.",
    [form.description],
  );

  const setFieldValue = (fieldId: string, value: InteractionFormValue) => {
    setValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
    setErrors((current) => {
      if (!(fieldId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  };

  const handleSubmit = async () => {
    const nextErrors = Object.fromEntries(
      form.fields
        .map((field) => [field.id, validateField(field, values[field.id] ?? "")])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isExpired) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <Sheet variant="outlined" sx={{ borderRadius: 12, p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
          {form.brand_image_url ? (
            <Box
              component="img"
              src={form.brand_image_url}
              alt={`${form.title} brand`}
              sx={{
                alignSelf: "flex-start",
                maxHeight: 64,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Box>
            <Typography level="h3">{form.title}</Typography>
            <Typography level="body-sm" color="neutral">
              {helperText}
            </Typography>
          </Box>
          <Chip color={statusColor} variant="solid">
            {statusLabel}
          </Chip>
        </Stack>

        {body ? (
          <Alert color="primary" variant="soft">
            {body}
          </Alert>
        ) : null}

        {serverError ? (
          <Alert color="danger" variant="soft">
            {serverError}
          </Alert>
        ) : null}

        <Stack spacing={2}>
          {form.fields.map((field) => {
            const addressValue: InteractionAddressValue = isAddressValue(values[field.id])
              ? (values[field.id] as InteractionAddressValue)
              : { text: "", place_id: "" };
            const checklist = getValidationChecklist(field, values[field.id] ?? "");

            return (
            <Box key={field.id}>
              {field.type === "address" ? (
                <AddressAutocompleteField
                  field={field}
                  replyToken={replyToken}
                  value={addressValue}
                  disabled={isExpired || isSubmitting}
                  error={errors[field.id]}
                  onChange={(value) => setFieldValue(field.id, value)}
                />
              ) : (
                <FormControl error={Boolean(errors[field.id])}>
                  <FormLabel>
                    {field.label}
                    {field.required ? " *" : ""}
                  </FormLabel>

                  {field.type === "textarea" ? (
                    <Textarea
                      minRows={3}
                      value={String(values[field.id] ?? "")}
                      placeholder={field.placeholder}
                      disabled={isExpired || isSubmitting}
                      onChange={(event) => setFieldValue(field.id, event.target.value)}
                    />
                  ) : null}

                  {field.type === "select" ? (
                    <Select
                      value={typeof values[field.id] === "string" ? String(values[field.id]) : null}
                      placeholder={field.placeholder ?? "Select an option"}
                      disabled={isExpired || isSubmitting}
                      onChange={(_event, value) => setFieldValue(field.id, value ?? "")}
                    >
                      {field.options?.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  ) : null}

                  {field.type === "checkbox" ? (
                    <Checkbox
                      checked={Boolean(values[field.id])}
                      disabled={isExpired || isSubmitting}
                      label={field.helper_text ?? "Yes"}
                      onChange={(event) => setFieldValue(field.id, event.target.checked)}
                    />
                  ) : null}

                  {!["textarea", "select", "checkbox", "address"].includes(field.type) ? (
                    <Input
                      type={field.type}
                      value={String(values[field.id] ?? "")}
                      placeholder={field.placeholder}
                      disabled={isExpired || isSubmitting}
                      onChange={(event) => setFieldValue(field.id, event.target.value)}
                    />
                  ) : null}

                  <FormHelperText>
                    {errors[field.id] ?? field.helper_text ?? " "}
                  </FormHelperText>

                  {checklist.length > 0 ? (
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {checklist.map((item) => (
                        <Typography
                          key={`${field.id}-${item.title}`}
                          level="body-xs"
                          sx={{
                            color:
                              item.status === "passed"
                                ? "success.600"
                                : item.status === "failed"
                                  ? "danger.600"
                                  : "neutral.500",
                          }}
                        >
                          {item.status === "passed" ? "✓" : "•"} {item.title}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </FormControl>
              )}
            </Box>
          )})}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={isExpired}
          >
            {form.submit_label ?? "Submit form"}
          </Button>
        </Box>
      </Stack>
    </Sheet>
  );
}
