import { forwardRef, type InputHTMLAttributes } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            ref={ref}
            {...props}
          />
          <div className="h-5 w-9 rounded-full border border-border bg-muted shadow-inner transition-colors duration-200 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
          <div className="absolute top-[2px] left-[2px] size-4 rounded-full bg-background shadow transition-transform duration-200 peer-checked:translate-x-4" />
        </div>
        {label && (
          <span className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Switch.displayName = "Switch";
