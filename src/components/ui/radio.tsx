import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              className="peer sr-only"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                "size-4 rounded-full border border-border bg-background transition-all shadow-sm peer-checked:border-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                error && "border-destructive peer-checked:border-destructive"
              )}
            />
            <div className="absolute size-1.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          {label && (
            <span className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="text-xs text-destructive font-medium animate-in fade-in-50 slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Radio.displayName = "Radio";
