import { Divider, Input, Option, Select } from "@mui/joy";
import { useMemo, useState, useEffect } from "react";

export type TimeUnit = "seconds" | "minutes" | "hours" | "days";

export const unitToSeconds: Record<TimeUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
};

export function getBestUnit(seconds: number): { amount: string; unit: TimeUnit } {
  const format = (val: number) => Number(val.toFixed(2)).toString();

  if (seconds >= 86400) return { amount: format(seconds / 86400), unit: "days" };
  if (seconds >= 3600) return { amount: format(seconds / 3600), unit: "hours" };
  if (seconds >= 60) return { amount: format(seconds / 60), unit: "minutes" };

  return { amount: format(seconds), unit: "seconds" };
}

export type DurationInputProps = {
  value: number | undefined;
  onChange: (seconds: number | undefined) => void;
  min?: number;
};

export function DurationInput({
  value,
  onChange,
  min = 1,
}: DurationInputProps) {
  const initial = useMemo(() => getBestUnit(value || 0), []);
  const [amount, setAmount] = useState(initial.amount);
  const [unit, setUnit] = useState<TimeUnit>(initial.unit);

  useEffect(() => {
    const currentSeconds = (Number(amount) || 0) * unitToSeconds[unit];
    if (currentSeconds !== (value || 0)) {
      const best = getBestUnit(value || 0);
      setAmount(best.amount);
      setUnit(best.unit);
    }
  }, [value]);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (val === "") {
      onChange(undefined);
      return;
    }
    const numeric = Number(val);
    if (Number.isFinite(numeric)) {
      onChange(numeric * unitToSeconds[unit]);
    }
  };

  const handleUnitChange = (newUnit: TimeUnit) => {
    setUnit(newUnit);
    if (amount === "") return;
    const numeric = Number(amount);
    if (Number.isFinite(numeric)) {
      onChange(numeric * unitToSeconds[newUnit]);
    }
  };

  return (
    <Input
      type="number"
      value={amount}
      onChange={(e) => handleAmountChange(e.target.value)}
      endDecorator={
        <>
          <Divider orientation="vertical" />
          <Select
            value={unit}
            variant="plain"
            onChange={(_, next) =>
              handleUnitChange((next ?? "seconds") as TimeUnit)
            }
            slotProps={{
              listbox: {
                variant: "outlined",
              },
            }}
            sx={{ mr: -1.5, "&:hover": { bgcolor: "transparent" } }}
          >
            <Option value="seconds">seconds</Option>
            <Option value="minutes">minutes</Option>
            <Option value="hours">hours</Option>
            <Option value="days">days</Option>
          </Select>
        </>
      }
      slotProps={{
        input: {
          min: min,
          step: "any",
        },
      }}
    />
  );
}

