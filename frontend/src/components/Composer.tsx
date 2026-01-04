import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X, Image, Barcode, Loader2 } from 'lucide-react';
import type { Attachment } from '@/types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { DropOverlay } from './DropOverlay';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ComposerProps {
  onSend: (content: string, attachments: Attachment[]) => void;
  isAnalyzing: boolean;
  className?: string;
}

export function Composer({ onSend, isAnalyzing, className }: ComposerProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const canSend = (content.trim() || attachments.length > 0) && !isAnalyzing;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    
    onSend(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    textareaRef.current?.focus();
  }, [content, attachments, canSend, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please use PNG, JPG, or WebP');
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 10MB');
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAttachments(prev => [
        ...prev.filter(a => a.type !== 'image'),
        { type: 'image', value: base64, fileName: file.name }
      ]);
    };
    reader.readAsDataURL(file);
    setShowMenu(false);
  }, []);

  const handleBarcodeScan = useCallback((barcode: string) => {
    setAttachments(prev => [
      ...prev.filter(a => a.type !== 'barcode'),
      { type: 'barcode', value: barcode }
    ]);
    setShowScanner(false);
    
    // Auto-send if no content
    if (!content.trim()) {
      setTimeout(() => {
        onSend('', [{ type: 'barcode', value: barcode }]);
        setAttachments([]);
      }, 100);
    }
  }, [content, onSend]);

  const removeAttachment = useCallback((type: 'image' | 'barcode') => {
    setAttachments(prev => prev.filter(a => a.type !== type));
  }, []);

  // Global drag handlers with counter to prevent flicker
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const imageFile = Array.from(files).find(f => ACCEPTED_TYPES.includes(f.type));
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast.error('Please drop a PNG, JPG, or WebP image');
    }
  }, [handleFileSelect]);

  // Global paste handler for Cmd/Ctrl+V
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleFileSelect(file);
        }
        return;
      }
    }
  }, [handleFileSelect]);

  // Register global event listeners
  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handlePaste]);

  return (
    <>
      {/* Drop Overlay */}
      <DropOverlay isVisible={isDragOver} />

      {/* Composer Container */}
      <div className={cn('composer-container', className)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 py-3 sm:py-4">
          {/* Attachments */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {attachments.map(att => (
                  <motion.div
                    key={att.type}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="attachment-chip"
                  >
                    {att.type === 'image' ? (
                      <>
                        <Image className="w-3.5 h-3.5" />
                        <span className="max-w-[100px] sm:max-w-[120px] truncate text-xs sm:text-sm">
                          {att.fileName}
                        </span>
                      </>
                    ) : (
                      <>
                        <Barcode className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs sm:text-sm">{att.value}</span>
                      </>
                    )}
                    <button
                      onClick={() => removeAttachment(att.type)}
                      className="p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                      aria-label={`Remove ${att.type}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Plus Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center',
                  'bg-secondary text-secondary-foreground',
                  'transition-colors hover:bg-secondary/80',
                  showMenu && 'bg-primary text-primary-foreground'
                )}
                aria-label="Attach file"
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-2 py-1.5 bg-card rounded-xl shadow-lg border border-border/50 min-w-[160px] z-20"
                    >
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Image className="w-4 h-4 text-muted-foreground" />
                        <span>Upload image</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowScanner(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Barcode className="w-4 h-4 text-muted-foreground" />
                        <span>Scan barcode</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste ingredients..."
                rows={1}
                className={cn(
                  'composer-input w-full rounded-2xl border border-border/50 bg-card',
                  'px-4 sm:px-5 py-3 pr-12 sm:pr-14',
                  'text-sm sm:text-base',
                  'placeholder:text-muted-foreground/50',
                  'focus:ring-2 focus:ring-primary/20 focus:border-primary/40',
                  'transition-all duration-150',
                  'max-h-32 scrollbar-thin resize-none'
                )}
                style={{ minHeight: '48px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />

              {/* Send Button */}
              <motion.button
                onClick={handleSend}
                disabled={!canSend}
                whileTap={canSend ? { scale: 0.95 } : {}}
                className={cn(
                  'absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2',
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center',
                  'transition-all duration-150',
                  canSend 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground',
                  isAnalyzing && 'bg-primary/80'
                )}
                aria-label="Send message"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
