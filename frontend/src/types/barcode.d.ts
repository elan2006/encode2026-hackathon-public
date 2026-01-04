declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(image: ImageBitmapSource): Promise<{ rawValue: string }[]>;
}

interface Window {
  BarcodeDetector: typeof BarcodeDetector;
}
