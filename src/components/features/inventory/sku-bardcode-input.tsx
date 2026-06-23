"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { ScanBarcode, Loader2, ZapOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SkuBarcodeInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    name?: string;
    required?: boolean;
    className?: string;
}

type ScannerState = "requesting" | "scanning" | "found" | "error";

export function SkuBarcodeInput({
    value,
    onChange,
    id = "sku",
    name = "sku",
    required,
    className,
}: SkuBarcodeInputProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [scannerState, setScannerState] = useState<ScannerState>("requesting");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [flashResult, setFlashResult] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);

    const stopScanner = useCallback(() => {
        readerRef.current?.reset();
        readerRef.current = null;
    }, []);

    const closeDialog = useCallback(() => {
        stopScanner();
        setDialogOpen(false);
        setScannerState("requesting");
        setErrorMessage(null);
        setFlashResult(null);
    }, [stopScanner]);

    const handleFound = useCallback(
        (code: string) => {
            setScannerState("found");
            setFlashResult(code);
            if (navigator.vibrate) navigator.vibrate(80);
            setTimeout(() => {
                onChange(code);
                closeDialog();
            }, 700);
        },
        [onChange, closeDialog]
    );

    useEffect(() => {
        if (!dialogOpen) return;

        let cancelled = false;
        setScannerState("requesting");

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        (async () => {
            try {
                const devices = await reader.listVideoInputDevices();
                if (cancelled) return;

                if (devices.length === 0) {
                    setScannerState("error");
                    setErrorMessage("No camera found on this device.");
                    return;
                }

                const rearCamera =
                    devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[0];

                setScannerState("scanning");

                await reader.decodeFromVideoDevice(
                    rearCamera.deviceId,
                    videoRef.current,
                    (result, err) => {
                        if (cancelled) return;
                        if (result) handleFound(result.getText());
                        if (err && !(err instanceof NotFoundException)) console.error(err);
                    }
                );
            } catch {
                if (!cancelled) {
                    setScannerState("error");
                    setErrorMessage("Camera permission denied or not available.");
                }
            }
        })();

        return () => {
            cancelled = true;
            reader.reset();
        };
    }, [dialogOpen, handleFound]);

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={id} className="text-text-secondary">
                SKU / Barcode
                {required && <span className="text-danger-text ml-0.5">*</span>}
            </Label>

            <div className="relative flex items-center">
                <Input
                    id={id}
                    name={name}
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type or scan barcode"
                    className="font-mono pr-9"
                    autoComplete="off"
                />
                <button
                    type="button"
                    title="Scan barcode with camera"
                    onClick={() => setDialogOpen(true)}
                    className="absolute right-2.5 p-1 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                >
                    <ScanBarcode className="w-4 h-4" />
                </button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-black border-border-subtle">
                    <DialogHeader className="px-5 pt-5 pb-3">
                        <DialogTitle className="text-white text-base font-medium flex items-center gap-2">
                            <ScanBarcode className="w-4 h-4 text-accent" />
                            Scan Barcode
                        </DialogTitle>
                    </DialogHeader>

                    {/* Camera viewport */}
                    <div className="relative bg-black overflow-hidden" style={{ aspectRatio: "4/3" }}>
                        <video
                            ref={videoRef}
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                                scannerState === "scanning" || scannerState === "found"
                                    ? "opacity-90"
                                    : "opacity-0"
                            )}
                        />

                        {/* Requesting */}
                        {scannerState === "requesting" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                <p className="text-white/60 text-sm">Accessing camera…</p>
                            </div>
                        )}

                        {/* Error */}
                        {scannerState === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                                <ZapOff className="w-8 h-8 text-danger-text" />
                                <p className="text-white text-sm font-medium">{errorMessage}</p>
                                <p className="text-white/50 text-xs">Close and type the barcode manually.</p>
                            </div>
                        )}

                        {/* Scanning / found overlay */}
                        {(scannerState === "scanning" || scannerState === "found") && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <div className="absolute inset-0 bg-black/25" />

                                {/* Reticle */}
                                <div className="relative z-10 w-3/5" style={{ aspectRatio: "3/1" }}>
                                    {[
                                        "top-0 left-0 border-t-2 border-l-2",
                                        "top-0 right-0 border-t-2 border-r-2",
                                        "bottom-0 left-0 border-b-2 border-l-2",
                                        "bottom-0 right-0 border-b-2 border-r-2",
                                    ].map((cls, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                "absolute w-4 h-4 transition-colors duration-200",
                                                cls,
                                                scannerState === "found" ? "border-accent" : "border-white"
                                            )}
                                        />
                                    ))}

                                    {/* Scan line */}
                                    {scannerState === "scanning" && (
                                        <div className="absolute inset-x-0 top-0 h-px bg-accent/80 animate-[scan_1.8s_ease-in-out_infinite]" />
                                    )}

                                    {/* Found flash */}
                                    {scannerState === "found" && flashResult && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 border border-accent">
                                            <span className="font-mono text-xs text-accent font-semibold tracking-widest px-3 py-1 rounded bg-black/50">
                                                {flashResult}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="absolute bottom-5 text-white/60 text-xs tracking-wide z-10">
                                    {scannerState === "found" ? "Barcode captured" : "Align barcode within the frame"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-white/10">
                        <p className="text-white/40 text-xs text-center">
                            Scanner closes automatically on a successful read
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes scan {
                    0%   { top: 0%;   opacity: 1; }
                    45%  { top: 100%; opacity: 1; }
                    50%  { opacity: 0; }
                    55%  { top: 0%;   opacity: 0; }
                    60%  { opacity: 1; }
                    100% { top: 0%;   opacity: 1; }
                }
            `}</style>
        </div>
    );
}