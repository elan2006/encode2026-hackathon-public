import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ArtifactCardProps {
  markdown: string;
}

export function ArtifactCard({ markdown }: ArtifactCardProps) {
  if (!markdown) {
    return null;
  }

  return (
    <div className="prose-sm dark:prose-invert max-w-none text-foreground">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export function ArtifactLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="artifact-card"
    >
      <div className="px-6 py-5 border-b border-border/30">
        <motion.div
          className="h-5 rounded bg-muted w-3/4"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="px-6 py-4 space-y-3">
        <motion.div
          className="h-3 rounded bg-muted w-1/4"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-4 rounded bg-muted/60"
              style={{ width: `${70 + Math.random() * 25}%` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface ArtifactErrorProps {
  error: string;
  onRetry: () => void;
}

export function ArtifactError({ error, onRetry }: ArtifactErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="artifact-card"
    >
      <div className="px-6 py-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error}
          </p>
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
