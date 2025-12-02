import { Typography, Tooltip, IconButton } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { ReactNode } from "react";

type InfoTooltipProps = {
  title: ReactNode; // The tooltip content
  size?: "small" | "medium" | "large"; // Pass through to IconButton

};

export function InfoTooltip({ title, size = "small"}: InfoTooltipProps) {
  return (
    <Tooltip
      sx={{color: "grey.600", borderRadius: 2, "&:hover": {color: "text.primary"}}}
      enterTouchDelay={0}
      leaveDelay={100}
      leaveTouchDelay={10000}
      placement="bottom"
      arrow
      title={
        typeof title === "string" ? <Typography>{title}</Typography> : title
      }
      slotProps={{
        popper: {
          sx: {
            zIndex: 10000,
          },
        },
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 1,
            maxWidth: 400,
            "& .MuiTooltip-arrow": {
              color: "background.paper",
              "&::before": {
                border: "1px solid",
                borderColor: "divider"
              },
            },
          },
        },
      }}
    >
      <IconButton size={size} >
        <InfoOutlined />
      </IconButton>
    </Tooltip>
  );
}
