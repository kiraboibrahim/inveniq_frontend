"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CustomSelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    id?: string;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    id,
}: CustomSelectProps) {
    return (
        <div className={cn("relative w-full", className)}>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    className={cn(
                        "h-9 w-full",
                        "rounded-md border border-border-subtle",
                        "bg-bg-elevated",
                        "px-3.5 text-sm text-text-primary",
                        "placeholder:text-text-tertiary/60",
                        "focus:outline-none focus:ring-2 focus:ring-accent/15 focus:ring-offset-0 focus:border-accent",
                        "transition-colors duration-[150ms] ease-out",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                        "cursor-pointer [&>span]:line-clamp-1",
                        triggerClassName
                    )}
                >
                    <SelectValue placeholder={<span className="text-text-tertiary/60">{placeholder}</span>} />
                </SelectTrigger>
                <SelectContent
                    className={cn(
                        "bg-bg-elevated border border-border-subtle rounded-md shadow-lg",
                        "text-text-primary p-1 max-h-60 overflow-y-auto z-[100]",
                        contentClassName
                    )}
                >
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className={cn(
                                "rounded-sm text-sm text-text-primary",
                                "py-2 pl-8 pr-2 cursor-pointer",
                                "focus:bg-bg-muted focus:text-text-primary",
                                "transition-colors duration-[150ms]",
                            )}
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}