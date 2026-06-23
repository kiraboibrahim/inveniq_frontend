import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            "flex min-h-[100px] w-full px-3.5 py-2.5",
            "rounded-md border border-border-subtle",
            "bg-bg-elevated",
            "text-sm text-text-primary font-body leading-relaxed",
            "placeholder:text-text-tertiary/60",
            "resize-y",
            "focus-visible:outline-none",
            "focus-visible:border-accent",
            "focus-visible:ring-2 focus-visible:ring-accent/15 focus-visible:ring-offset-0",
            "transition-colors duration-[150ms] ease-out",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "read-only:text-text-secondary read-only:cursor-default",
            className
        )}
        {...props}
    />
));
Textarea.displayName = "Textarea";

export { Textarea };