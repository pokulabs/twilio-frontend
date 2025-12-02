import { TextField, TextFieldProps, Autocomplete, Box } from "@mui/material";
import { CreateTextField } from "./CreateTextField";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";
import { forwardRef, useState } from "react";
import PhoneNumberInput from "react-phone-number-input/input";
import type { CountryCode } from "libphonenumber-js";

export function HumanNumberInput({
  onChange,
}: {
  onChange: (val: string) => void;
}) {
  const [country, setCountry] = useState<CountryCode | undefined>("US");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1,
        mt: 1,
      }}
    >
      <CountrySelect
        labels={en}
        value={country}
        onChange={setCountry}
        size="small"
        sx={{
          width: 1/3,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            borderRadius: 2,
            "&:hover fieldset": {
              borderColor: "primary.light"
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main"
            }
          },
        }}
      />

      <Box sx={{ flex: 1 }}>
        <PhoneNumberInput
          onChange={(val?: string) => {
            onChange(val ?? "");
          }}
          country={country}
          placeholder="Enter phone number"
          inputComponent={MuiPhoneInput}
          smartCaret={false}
        />
      </Box>
    </Box>
  );
}

const MuiPhoneInput = forwardRef<HTMLInputElement, TextFieldProps>(
  function MuiPhoneInput(props, ref) {
    return (
      <CreateTextField
        {...props}
        ref={ref}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        fullWidth
      />
    );
  },
);

type CountrySelectProps = {
  value?: CountryCode;
  onChange: (value?: CountryCode) => void;
  labels: Record<string, string>;
  [key: string]: unknown;
};

const CountrySelect = ({
  value,
  onChange,
  labels,
  ...rest
}: CountrySelectProps) => (
  <Autocomplete<CountryCode, false, any, false>
    {...rest}
    value={value ?? null}
    onChange={(_, newValue) => onChange(newValue ?? undefined)}
    options={getCountries()}
    getOptionLabel={(country) =>
      `${labels[country] || country} +${getCountryCallingCode(country)}`
    }
    disableClearable={true}
    renderInput={(params) => <TextField {...params}/>}
  />
);
