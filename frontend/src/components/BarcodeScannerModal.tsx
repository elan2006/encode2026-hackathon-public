import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

type ScannerState = 'initializing' | 'ready' | 'scanning' | 'error';

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScannerState>('initializing');
  const [error, setError] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setState('initializing');
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setState('ready');
        startScanning();
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
      }
      setState('error');
    }
  }, []);

  const startScanning = useCallback(() => {
    if (!videoRef.current || state !== 'ready') return;

    setState('scanning');

    // Check for BarcodeDetector API
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });

      const scan = async () => {
        if (!videoRef.current || !isOpen) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            stopCamera();
            onScan(barcode);
            return;
          }
        } catch (e) {
          // Ignore detection errors
        }

        if (isOpen) {
          requestAnimationFrame(scan);
        }
      };

      scan();
    } else {
      // Fallback: simulate scan after delay for demo
      setTimeout(() => {
        if (isOpen) {
          const mockBarcode = '8901234567890';
          stopCamera();
          onScan(mockBarcode);
        }
      }, 2500);
    }
  }, [state, isOpen, onScan, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setState('initializing');
    }

    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-lg overflow-hidden fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Scan Barcode</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scanner View */}
        <div className="relative aspect-[4/3] bg-foreground/10">
          {state === 'error' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Viewfinder overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 scanner-viewfinder rounded-lg" />
              </div>

              {/* Status */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium',
                  'bg-card/90 backdrop-blur-sm shadow-sm',
                  'flex items-center gap-2'
                )}>
                  {state === 'initializing' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Starting camera...</span>
                    </>
                  )}
                  {(state === 'ready' || state === 'scanning') && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>Point at barcode</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Align the barcode within the frame
          </p>
        </div>
      </div>
    </div>
  );
}
