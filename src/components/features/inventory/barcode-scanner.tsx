"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { X } from "lucide-react";
import { useInventoryStore } from "@/store/inventory-store";

export function BarcodeScanner() {
  const { isScannerOpen, setScannerOpen } = useInventoryStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

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

        const selectedDeviceId = videoInputDevices[0].deviceId;
        
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId, 
          videoRef.current, 
          (result, err) => {
            if (result) {
              setScannedResult(result.getText());
              // Play a subtle success sound or vibrate
              if (navigator.vibrate) navigator.vibrate(100);
              
              // Give user a moment to see the success state
              setTimeout(() => {
                setScannerOpen(false);
                setScannedResult(null);
                // Here we would normally trigger the product search or fill
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
  }, [isScannerOpen, setScannerOpen]);

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-medium">Scan Barcode</h2>
        <button 
          onClick={() => setScannerOpen(false)}
          className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
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
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Targeting Reticle */}
            <div className="relative w-64 h-64 border-2 border-white/20 z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white transition-all duration-300" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white transition-all duration-300" />
              
              {scannedResult && (
                <div className="absolute inset-0 bg-success/20 animate-pulse border-4 border-success z-20 flex items-center justify-center">
                  <span className="bg-success text-bg-base px-3 py-1 rounded-md font-mono font-bold">
                    {scannedResult}
                  </span>
                </div>
              )}
            </div>
            <p className="absolute bottom-20 text-white/70 text-sm">Position barcode inside the frame</p>
          </>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className="p-6 bg-bg-surface border-t border-border-strong w-full">
        <label className="block text-sm text-text-secondary mb-2">Or enter code manually</label>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="e.g. 123456789012"
            className="flex-1 bg-bg-elevated border border-border-subtle rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent font-mono"
          />
          <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-md font-medium transition-colors">
            Lookup
          </button>
        </div>
      </div>
    </div>
  );
}
