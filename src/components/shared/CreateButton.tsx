import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@mui/joy";
import type { ButtonProps } from "@mui/joy";

type SaveStatus = "idle" | "saving" | "success" | "error";

type CreateButtonProps = Omit<ButtonProps, "onClick"> & {
  onCreate: () => Promise<void>;
  texts?: Partial<Record<SaveStatus, string>>;
};

export function CreateButton({
  onCreate,
  disabled,
  children,
  texts,
  color,
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
      await onCreate();
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
    if (status === "error") return "danger";
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
      color={computedColor}
      loading={status === "saving"}
      disabled={disabled || status === "saving"}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

export default CreateButton;
