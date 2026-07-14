import { useNotificationStore, type ToastItem } from "@/stores/notification.store";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const toasts = useNotificationStore((state: any) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast: ToastItem) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const removeToast = useNotificationStore((state: any) => state.removeToast);

  const icons = {
    success: <CheckCircle2 className="size-4 text-success" />,
    error: <AlertCircle className="size-4 text-destructive" />,
    warning: <AlertTriangle className="size-4 text-warning" />,
    info: <Info className="size-4 text-info" />,
  };

  const borderColors = {
    success: "border-success/30",
    error: "border-destructive/30",
    warning: "border-warning/30",
    info: "border-info/30",
  };

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-full p-4 rounded-xl border bg-card text-card-foreground shadow-lg animate-in slide-in-from-top-4 fade-in duration-200",
        borderColors[toast.type]
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      
      <div className="flex-1 text-sm font-medium leading-5">
        {toast.message}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Close notification"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
