import { motion } from 'framer-motion';
import { Image } from 'lucide-react';

interface DropOverlayProps {
  isVisible: boolean;
}

export function DropOverlay({ isVisible }: DropOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="drop-overlay"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="drop-zone active"
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Image className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            Drop image to analyze
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG, or WebP up to 10MB
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
