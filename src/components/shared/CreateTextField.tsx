import { TextField, TextFieldProps } from "@mui/material";

export function CreateTextField(props: TextFieldProps) {
  return(
    <TextField 
      fullWidth
      size="small"
      {...props}
      sx={{
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
        ...props.sx
      }}
    />
  )
}