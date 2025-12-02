import { Checkbox, FormControlLabel, Box } from "@mui/material";
import type { CheckboxProps, FormControlLabelProps } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export interface CreateCheckboxProps
  extends Omit<FormControlLabelProps, "control"> {
  checkboxProps?: CheckboxProps;
}

export default function CreateCheckbox({
  checkboxProps,
  label,
  ...rest
}: CreateCheckboxProps) {
  return (
    <FormControlLabel
      {...rest}
      label={label}
      sx={{
        "&:hover .uncheckedBox": {
          bgcolor: "action.hover",
        },
        "&:hover .checkedBox": {
          bgcolor: "primary.dark",
        },
      }}
      control={
        <Checkbox
          {...checkboxProps}
          disableRipple 
          sx={{
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&:hover .uncheckedBox": {
              bgcolor: "action.hover",
            },
            "&.Mui-checked:hover .checkedBox": {
              bgcolor: "primary.dark",
            },
          }}
          icon={
            <Box
              className="uncheckedBox"
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.15s ease",
              }}
            />
          }
          checkedIcon={
            <Box
              className="checkedBox"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: "primary.main",
                color: "common.white",
                border: "1px solid",
                borderColor: "primary.main",
                transition: "all 0.15s ease",
              }}
            >
              <CheckIcon sx={{ fontSize: 17 }} />
            </Box>
          }
        />
      }
    />
  );
}
