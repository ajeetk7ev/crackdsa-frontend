import { type ElementType, type ForwardedRef, forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "subtitle"
  | "body"
  | "small"
  | "caption"
  | "muted";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TypographyVariant;
}

const variantStyles: Record<TypographyVariant, string> = {
  display: "text-3xl font-light tracking-tight text-foreground sm:text-4xl",
  h1: "text-2xl font-semibold tracking-tight text-foreground",
  h2: "text-xl font-medium tracking-tight text-foreground",
  h3: "text-lg font-medium text-foreground",
  title: "text-base font-semibold text-foreground",
  subtitle: "text-sm font-medium text-text-secondary",
  body: "text-sm text-foreground leading-relaxed",
  small: "text-xs font-medium text-foreground",
  caption: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider",
  muted: "text-sm text-muted-foreground",
};

const defaultElements: Record<TypographyVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  title: "h4",
  subtitle: "p",
  body: "p",
  small: "span",
  caption: "span",
  muted: "p",
};

export const Typography = forwardRef(
  (
    { as, variant = "body", className, children, ...props }: TypographyProps,
    ref: ForwardedRef<HTMLElement>
  ) => {
    const Component = as || defaultElements[variant];

    return (
      <Component
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";
