import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full px-3.5 py-2",
                    "rounded-md border border-border-subtle",
                    "bg-bg-elevated",
                    "text-sm text-text-primary font-body",
                    "placeholder:text-text-tertiary/60",
                    type === "number" || type === "tel" ? "font-mono" : "",
                    "focus-visible:outline-none",
                    "focus-visible:border-accent",
                    "focus-visible:ring-2 focus-visible:ring-accent/15 focus-visible:ring-offset-0",
                    "transition-colors duration-[150ms] ease-out",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    "read-only:text-text-secondary read-only:cursor-default",
                    "[appearance:textfield]",
                    "[&::-webkit-outer-spin-button]:appearance-none",
                    "[&::-webkit-inner-spin-button]:appearance-none",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }