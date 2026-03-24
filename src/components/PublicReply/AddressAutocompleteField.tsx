import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  AutocompleteOption,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  ListItemContent,
  Typography,
} from "@mui/joy";

import { apiClient } from "../../api-client";
import type {
  InteractionAddressValue,
  InteractionFormField,
} from "../../types/backend-frontend";

type AddressSuggestion = {
  placeId: string;
  text: string;
  mainText?: string;
  secondaryText?: string;
};

interface AddressAutocompleteFieldProps {
  field: InteractionFormField;
  replyToken: string;
  value: InteractionAddressValue;
  disabled: boolean;
  error?: string;
  onChange: (value: InteractionAddressValue) => void;
}

function createSessionToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AddressAutocompleteField({
  field,
  replyToken,
  value,
  disabled,
  error,
  onChange,
}: AddressAutocompleteFieldProps) {
  const [inputValue, setInputValue] = useState(value.text);
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionTokenRef = useRef(createSessionToken());
  const requestIdRef = useRef(0);

  useEffect(() => {
    setInputValue(value.text);
  }, [value.text]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 3) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await apiClient.autocompleteAddress(
          replyToken,
          trimmed,
          sessionTokenRef.current,
        );
        if (requestId !== requestIdRef.current) {
          return;
        }
        setOptions(response.data?.suggestions ?? []);
      } catch {
        if (requestId === requestIdRef.current) {
          setOptions([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue, replyToken]);

  const selectedOption = useMemo(
    () =>
      value.place_id
        ? options.find((option) => option.placeId === value.place_id) ?? {
            placeId: value.place_id,
            text: value.text,
            mainText: value.text,
          }
        : null,
    [options, value.place_id, value.text],
  );

  return (
    <FormControl error={Boolean(error)}>
      <FormLabel>
        {field.label}
        {field.required ? " *" : ""}
      </FormLabel>
      <Autocomplete<AddressSuggestion, false, false, false>
        value={selectedOption}
        inputValue={inputValue}
        placeholder={field.placeholder ?? "Search for an address"}
        disabled={disabled}
        loading={loading}
        options={options}
        autoHighlight
        noOptionsText={
          inputValue.trim().length < 3
            ? "Type at least 3 characters"
            : "No addresses found"
        }
        filterOptions={(x) => x}
        getOptionLabel={(option) => option.text}
        isOptionEqualToValue={(option, currentValue) =>
          option.placeId === currentValue.placeId
        }
        loadingText={
          <Typography level="body-sm" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size="sm" />
            Searching addresses...
          </Typography>
        }
        onInputChange={(_event, nextValue, reason) => {
          setInputValue(nextValue);
          if (reason === "input") {
            onChange({
              text: nextValue,
              place_id: "",
            });
          }
        }}
        onChange={(_event, option) => {
          if (!option) {
            onChange({
              text: inputValue,
              place_id: "",
            });
            return;
          }

          onChange({
            text: option.text,
            place_id: option.placeId,
          });
          setInputValue(option.text);
        }}
        renderOption={(props, option) => (
          <AutocompleteOption {...props} key={option.placeId}>
            <ListItemContent>
              <Typography level="body-md">
                {option.mainText ?? option.text}
              </Typography>
              {option.secondaryText ? (
                <Typography level="body-sm" color="neutral">
                  {option.secondaryText}
                </Typography>
              ) : null}
            </ListItemContent>
          </AutocompleteOption>
        )}
      />
      <FormHelperText>
        {error ?? field.helper_text ?? "Choose an address from the suggestions."}
      </FormHelperText>
    </FormControl>
  );
}
