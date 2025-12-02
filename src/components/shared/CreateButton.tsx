import { useCallback, useMemo, useRef, useState } from "react";
import {Button} from "@mui/material"
import type { ButtonProps } from "@mui/material";

type SaveStatus = "idle" | "saving" | "success" | "error";

type CreateButtonProps =
  | (Omit<ButtonProps, "onClick"> & {
    onCreate: () => Promise<unknown>;
    texts?: Partial<Record<SaveStatus, string>>;
    showLabels?: boolean;
    showColors?: boolean;
  })
  | (Omit<ButtonProps, "onClick"> & {
    href: string;
    target?: string;
    rel?: string;
    onCreate?: never;
    texts?: never;        
    showLabels?: boolean;
    showColors?: boolean;
  })

export function CreateButton({
  onCreate,
  disabled,
  children,
  texts,
  color,
  showLabels = true,
  showColors = true,
  ...rest
}: CreateButtonProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<number | null>(null);

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleClick = useCallback(async () => {
    clearExistingTimeout();
    setStatus("saving");
    try {
      if(onCreate) await onCreate()
      setStatus("success");
      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        timeoutRef.current = null;
      }, 2000);
    } catch (e) {
      setStatus("error");
      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        timeoutRef.current = null;
      }, 4000);
    }
  }, [onCreate]);

  const computedColor = useMemo(() => {
    if (status === "success") return "success";
    if (status === "error") return "error";
    return color;
  }, [status, color]);

  const label = useMemo(() => {
    if (status === "saving") return texts?.saving ?? "Creating...";
    if (status === "success") return texts?.success ?? "Created";
    if (status === "error") return texts?.error ?? "Failed";
    return (children as any) ?? texts?.idle ?? "Create";
  }, [status, texts, children]);

  return (
    <Button
      {...rest}
      color={showColors ? computedColor : undefined}
      loading={status === "saving"}
      disabled={disabled || status === "saving"}
      onClick={handleClick}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 1.5,
        "&.Mui-disabled": {
          backgroundColor: "grey.100",
        }
      }}
      >
      {showLabels ? label : children}
    </Button>
  );
}

export default CreateButton;


