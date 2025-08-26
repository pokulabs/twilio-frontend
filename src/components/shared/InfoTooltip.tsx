import { Tooltip, IconButton, Typography } from "@mui/joy";
import { InfoOutlined } from "@mui/icons-material";
import { ReactNode } from "react";

type InfoTooltipProps = {
  title: ReactNode; // The tooltip content
  size?: "sm" | "md" | "lg"; // Pass through to IconButton
};

export function InfoTooltip({ title, size = "sm" }: InfoTooltipProps) {
  return (
    <Tooltip
      sx={{ maxWidth: 400, zIndex: 10000 }}
      enterTouchDelay={0}
      leaveDelay={100}
      leaveTouchDelay={10000}
      variant="outlined"
      placement="bottom"
      arrow
      title={
        typeof title === "string" ? <Typography>{title}</Typography> : title
      }
    >
      <IconButton size={size}>
        <InfoOutlined />
      </IconButton>
    </Tooltip>
  );
}
