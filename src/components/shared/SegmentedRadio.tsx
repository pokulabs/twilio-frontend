import {FormControlLabel, Radio, RadioGroup} from "@mui/material"

export type SegmentedRadioOption<ValueT extends string | number> = {
  value: ValueT;
  label: string;
};

export function SegmentedRadio<ValueT extends string | number>({
  value,
  onChange,
  options,
}: {
  value: ValueT;
  onChange: (v: ValueT) => void;
  options: SegmentedRadioOption<ValueT>[];
}) {
  return (
    <RadioGroup
      row
      value={value as any}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        const casted = (
          typeof value === "number" ? Number(raw) : (raw as any)
        ) as ValueT;
        onChange(casted);
      }}
      sx={{
        width: "100%",
        minHeight: 35,
        borderRadius: 3,
        padding: "3px",
        bgcolor: "grey.100",
        gap: "4px",
      }}
    >
  {options.map((item) => {
    const isChecked = value === item.value;
    return (
      <FormControlLabel
        key={item.value.toString()}
        value={item.value}
        control={<Radio sx={{ display: 'none' }} />}
        label={item.label}
        sx={{
          px: 2,
          py: 0.5,
          m: 0,
          flex: 1,
          justifyContent: "center",
          textAlign: "center",
          borderRadius: 3,
          transition: "all 0.2s",
          cursor: "pointer",
          bgcolor: isChecked ? "background.paper" : "transparent",
          boxShadow: isChecked ? 1 : 0,
          "&:hover": {
            bgcolor: isChecked ? "background.paper" : "grey.300",
          },
          "& .MuiFormControlLabel-label": {
            width: "100%",
          },
        }}
      />
    );
  })}
</RadioGroup>
  );
}

export default SegmentedRadio;
