import { motion } from 'framer-motion';
import { parseArtifactMarkdown } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ArtifactCardProps {
  markdown: string;
  className?: string;
}

export function ArtifactCard({ markdown, className }: ArtifactCardProps) {
  const artifact = parseArtifactMarkdown(markdown);
  
  const hasContent = artifact.verdict || artifact.keyFindings?.length || 
    artifact.whoShouldCare || artifact.theCatch || artifact.bottomLine;

  if (!hasContent) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('artifact-card', className)}
    >
      {/* Verdict - Always prominent */}
      {artifact.verdict && (
        <div className="px-6 py-5 border-b border-border/30">
          <p className="text-base font-medium text-foreground leading-relaxed">
            {artifact.verdict}
          </p>
        </div>
      )}

      {/* Key Findings - Bullets, max 3 */}
      {artifact.keyFindings && artifact.keyFindings.length > 0 && (
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Key Findings
          </h3>
          <ul className="space-y-2">
            {artifact.keyFindings.map((finding, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/90">
                <span className="text-primary mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Who Should Care */}
      {artifact.whoShouldCare && (
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Who Should Care
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {artifact.whoShouldCare}
          </p>
        </div>
      )}

      {/* The Catch */}
      {artifact.theCatch && (
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            The Catch
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {artifact.theCatch}
          </p>
        </div>
      )}

      {/* Bottom Line - Final, actionable */}
      {artifact.bottomLine && (
        <div className="px-6 py-4 bg-primary/5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
            The Bottom Line
          </h3>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {artifact.bottomLine}
          </p>
        </div>
      )}
    </motion.div>
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
          {[1, 2, 3].map(i => (
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
