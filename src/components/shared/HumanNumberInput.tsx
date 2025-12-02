import { Autocomplete, Box, Input as JoyInput } from "@mui/joy";
import type { InputProps as JoyInputProps } from "@mui/joy/Input";
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
        sx={{ minWidth: { xs: "100%", sm: 260 } }}
      />

      <Box sx={{ flex: 1 }}>
        <PhoneNumberInput
          onChange={(val?: string) => {
            onChange(val ?? "");
          }}
          country={country}
          placeholder="Enter phone number"
          inputComponent={JoyPhoneInput}
          smartCaret={false}
        />
      </Box>
    </Box>
  );
}

const JoyPhoneInput = forwardRef<HTMLInputElement, JoyInputProps>(
  function JoyPhoneInput(props, ref) {
    return (
      <JoyInput
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
  />
);
