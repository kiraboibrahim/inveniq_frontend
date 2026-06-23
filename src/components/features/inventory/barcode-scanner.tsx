"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { X, Loader2, Search } from "lucide-react";
import { useInventoryStore } from "@/store/inventory-store";
import { inventoryService } from "@/services/api";
import { toast } from "sonner";

export function BarcodeScanner() {
    const { isScannerOpen, setScannerOpen, openDrawer } = useInventoryStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleLookup = async (code: string) => {
        setIsSearching(true);
        try {
            const product = await inventoryService.getProductBySku(code);
            if (product) {
                toast.success(`Found: ${product.name}`);
                setScannerOpen(false);
                openDrawer(product.id);
            } else {
                toast.error(`No product found with barcode: ${code}`);
            }
        } catch (err) {
            toast.error("Error looking up barcode");
        } finally {
            setIsSearching(false);
        }
    };

    // Store latest handleLookup in a ref to avoid stale closure in ZXing callback
    // without forcing the useEffect camera loop to restart
    const handleLookupRef = useRef(handleLookup);
    useEffect(() => {
        handleLookupRef.current = handleLookup;
    });

    useEffect(() => {
        if (!isScannerOpen) return;

        const codeReader = new BrowserMultiFormatReader();

        const startScanning = async () => {
            try {
                const videoInputDevices = await codeReader.listVideoInputDevices();
                if (videoInputDevices.length === 0) {
                    setError("No camera found on this device.");
                    return;
                }

                // Look for back/rear facing camera
                const backCamera = videoInputDevices.find(device => 
                    device.label.toLowerCase().includes("back") || 
                    device.label.toLowerCase().includes("rear") || 
                    device.label.toLowerCase().includes("environment")
                );

                const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

                await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (result, err) => {
                        if (result) {
                            const code = result.getText();
                            setScannedResult(code);
                            if (navigator.vibrate) navigator.vibrate(100);

                            setTimeout(() => {
                                handleLookupRef.current(code);
                                setScannedResult(null);
                            }, 1000);
                        }
                        if (err && !(err instanceof NotFoundException)) {
                            console.error(err);
                        }
                    }
                );
            } catch (err) {
                setError("Camera permission denied or not available.");
                console.error(err);
            }
        };

        startScanning();

        return () => {
            codeReader.reset();
        };
    }, [isScannerOpen]);

    if (!isScannerOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4">
                <h2 className="text-white text-lg font-medium">Scan Barcode</h2>
                <button
                    title="Close Barcode Scanner"
                    onClick={() => setScannerOpen(false)}
                    className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="text-center p-6 text-white">
                        <p className="text-danger-text mb-4">{error}</p>
                        <p className="text-white/60 mb-8">Please enter the barcode manually.</p>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        {/* Targeting Reticle */}
                        <div className="relative w-64 h-64 border-2 border-white/20 z-10">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white transition-all duration-300" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white transition-all duration-300" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white transition-all duration-300" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white transition-all duration-300" />

                            {(scannedResult || isSearching) && (
                                <div className="absolute inset-0 bg-accent/20 animate-pulse border-4 border-accent z-20 flex items-center justify-center">
                                    <div className="bg-accent text-white px-4 py-2 rounded-md font-mono flex items-center gap-2">
                                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : scannedResult}
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="absolute bottom-20 text-white/70 text-sm font-medium tracking-wide">
                            {isSearching ? "Searching for product..." : "Position barcode inside the frame"}
                        </p>
                    </>
                )}
            </div>

            {/* Manual Entry Fallback */}
            <div className="p-6 bg-bg-surface border-t border-border-strong w-full">
                <label className="block text-sm text-text-secondary mb-2 font-medium">Or enter code manually</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && manualCode && handleLookup(manualCode)}
                        placeholder="e.g. 123456789012"
                        className="flex-1 bg-bg-elevated border border-border-subtle rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent font-mono transition-colors"
                    />
                    <button
                        disabled={!manualCode || isSearching}
                        onClick={() => handleLookup(manualCode)}
                        className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Lookup
                    </button>
                </div>
            </div>
        </div>
    );
}
