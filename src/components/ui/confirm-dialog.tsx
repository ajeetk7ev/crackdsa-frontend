import { Dialog } from "./dialog";
import { Button } from "./button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const buttonVariantMap = {
    primary: "default" as const,
    danger: "destructive" as const,
    warning: "secondary" as const, // warning style
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          type="button"
        >
          {cancelText}
        </Button>
        <Button
          variant={buttonVariantMap[variant]}
          onClick={onConfirm}
          disabled={isLoading}
          type="button"
          className={variant === "warning" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
