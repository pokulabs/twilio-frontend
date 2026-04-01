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
  InteractionFormField,
  InteractionFormRequest,
  InteractionFormValue,
} from "../../types/backend-frontend";
import AddressAutocompleteField from "./AddressAutocompleteField";

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

function isAddressValue(value: InteractionFormValue): value is InteractionAddressValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    "place_id" in value &&
    typeof value.text === "string" &&
    typeof value.place_id === "string"
  );
}

function validateField(field: InteractionFormField, value: InteractionFormValue) {
  if (field.type === "address") {
    if (!isAddressValue(value) || !value.text.trim() || !value.place_id.trim()) {
      return field.required
        ? `${field.label} must be selected from the address suggestions.`
        : null;
    }
    return null;
  }

  if (field.type === "checkbox") {
    if (field.required && value !== true) {
      return `${field.label} is required.`;
    }
    return null;
  }

  const stringValue = typeof value === "string" ? value.trim() : "";
  if (!stringValue) {
    return field.required ? `${field.label} is required.` : null;
  }

  if (field.min_length !== undefined && stringValue.length < field.min_length) {
    return `${field.label} must be at least ${field.min_length} characters.`;
  }

  if (field.max_length !== undefined && stringValue.length > field.max_length) {
    return `${field.label} must be ${field.max_length} characters or fewer.`;
  }

  if (
    field.type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
  ) {
    return `${field.label} must be a valid email address.`;
  }

  if (
    field.type === "select" &&
    !field.options?.some((option) => option.value === stringValue)
  ) {
    return `${field.label} must be one of the provided options.`;
  }

  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(stringValue)) {
      return `${field.label} is invalid.`;
    }
  }

  return null;
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

            return (
            <Box key={field.id}>
              {field.type === "address" ? (
                <AddressAutocompleteField
                  field={field}
                  replyToken={replyToken}
                  value={addressValue}
                  disabled={isExpired || isSubmitting}
                  error={errors[field.id]}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [field.id]: value,
                    }))
                  }
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
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.id]: event.target.value,
                        }))
                      }
                    />
                  ) : null}

                  {field.type === "select" ? (
                    <Select
                      value={typeof values[field.id] === "string" ? String(values[field.id]) : null}
                      placeholder={field.placeholder ?? "Select an option"}
                      disabled={isExpired || isSubmitting}
                      onChange={(_event, value) =>
                        setValues((current) => ({
                          ...current,
                          [field.id]: value ?? "",
                        }))
                      }
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
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.id]: event.target.checked,
                        }))
                      }
                    />
                  ) : null}

                  {!["textarea", "select", "checkbox", "address"].includes(field.type) ? (
                    <Input
                      type={field.type}
                      value={String(values[field.id] ?? "")}
                      placeholder={field.placeholder}
                      disabled={isExpired || isSubmitting}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.id]: event.target.value,
                        }))
                      }
                    />
                  ) : null}

                  <FormHelperText>
                    {errors[field.id] ?? field.helper_text ?? " "}
                  </FormHelperText>
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
