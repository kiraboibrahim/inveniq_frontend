"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "./input";
import { formatUgPhone, validateUgPhone } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";

interface UgPhoneInputProps
    extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
    onChange?: (raw: string) => void;
    initialValue?: string;
}

export const UgPhoneInput = React.forwardRef<HTMLInputElement, UgPhoneInputProps>(
    ({ className, onChange, initialValue = "", onBlur, ...props }, ref) => {
        const [displayVal, setDisplayVal] = useState(() =>
            initialValue ? formatUgPhone(initialValue) : ""
        );
        const [touched, setTouched] = useState(false);
        const [isValid, setIsValid] = useState(true);

        // Sync when initialValue changes externally (e.g. edit mode pre-fill)
        useEffect(() => {
            if (initialValue) {
                setDisplayVal(formatUgPhone(initialValue));
            }
        }, [initialValue]);

        const getRaw = (formatted: string) => formatted.replace(/\s+/g, "");

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatUgPhone(e.target.value);
            setDisplayVal(formatted);

            const raw = getRaw(formatted);
            onChange?.(raw);

            // Show validation feedback early once the user has typed enough
            if (touched || raw.length > 5) {
                setIsValid(raw.length === 0 || validateUgPhone(formatted));
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true);
            const raw = getRaw(displayVal);
            // Empty is valid — HTML5 `required` handles the empty case
            setIsValid(raw.length === 0 || validateUgPhone(displayVal));
            onBlur?.(e);
        };

        const showError = !isValid && getRaw(displayVal).length > 0;

        return (
            <div className="w-full space-y-1.5">
                <Input
                    ref={ref}
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+256 700 000 000"
                    value={displayVal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        showError && "border-danger focus-visible:ring-danger/20",
                        className
                    )}
                    aria-invalid={showError}
                    aria-describedby={showError ? `${props.id}-error` : undefined}
                    {...props}
                />
                {showError && (
                    <p
                        id={`${props.id}-error`}
                        role="alert"
                        className="text-xs text-danger-text leading-snug"
                    >
                        Enter a valid Ugandan number — +256 7XX XXX XXX or 07XX XXX XXX.
                    </p>
                )}
            </div>
        );
    }
);

UgPhoneInput.displayName = "UgPhoneInput";