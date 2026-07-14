import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Inline Spinner Icon
export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Loader2
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      role="status"
      {...props}
    />
  );
}

// 2. Full Page Loader Cover
export function PageLoader({ message = "Loading CrackDSA..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium tracking-tight text-text-secondary animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

// 3. Shimmer Block Skeleton primitive
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-muted/60 dark:bg-muted/40", className)}
      {...props}
    />
  );
}

// 4. Grid Card Skeleton loader
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 5. Table Rows Skeleton loader
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border border-border rounded-xl bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-6 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <Skeleton key={cIdx} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border px-6">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
