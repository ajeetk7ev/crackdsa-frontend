import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options = [], children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 pr-10 text-sm shadow-sm transition-all outline-none appearance-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown className="size-4" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive font-medium animate-in fade-in-50 slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
