import { Radio, RadioGroup } from "@mui/joy";

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
      orientation="horizontal"
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
        padding: "4px",
        borderRadius: "12px",
        bgcolor: "neutral.softBg",
        "--RadioGroup-gap": "4px",
        "--Radio-actionRadius": "8px",
      }}
    >
      {options.map((item) => (
        <Radio
          key={item.value.toString()}
          color="neutral"
          value={item.value}
          disableIcon
          label={item.label}
          variant="plain"
          sx={{
            px: 2,
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            textAlign: "center",
          }}
          slotProps={{
            action: ({ checked }) => ({
              sx: {
                ...(checked && {
                  bgcolor: "background.surface",
                  boxShadow: "sm",
                  "&:hover": {
                    bgcolor: "background.surface",
                  },
                }),
              },
            }),
          }}
        />
      ))}
    </RadioGroup>
  );
}

export default SegmentedRadio;
