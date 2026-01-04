import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Clock, MessageSquare } from 'lucide-react';
import type { Conversation, ConversationStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SidebarHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

function StatusIndicator({ status }: { status: ConversationStatus }) {
  return (
    <span
      className={cn('status-indicator', {
        done: status === 'done',
        analyzing: status === 'analyzing',
        failed: status === 'failed',
      })}
      aria-label={`Status: ${status}`}
    />
  );
}

export function SidebarHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: SidebarHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Persist expanded state
  useEffect(() => {
    const stored = localStorage.getItem('vitascan-sidebar-expanded');
    if (stored === 'true') setIsExpanded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('vitascan-sidebar-expanded', String(isExpanded));
  }, [isExpanded]);

  const shouldShowExpanded = isExpanded || isHovered;

  return (
    <motion.aside
      ref={sidebarRef}
      initial={false}
      animate={{ width: shouldShowExpanded ? 320 : 72 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 h-full bg-secondary/30 border-r border-border/40 flex flex-col z-40 overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
        <AnimatePresence>
          {shouldShowExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-foreground/70"
            >
              History
            </motion.span>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'p-2 rounded-lg transition-colors focus-ring',
            'hover:bg-secondary text-muted-foreground hover:text-foreground',
            !shouldShowExpanded && 'mx-auto'
          )}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div
            animate={{ rotate: shouldShowExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <motion.button
          onClick={onNewConversation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-3 w-full p-3 rounded-xl',
            'bg-primary text-primary-foreground',
            'font-medium text-sm transition-colors',
            'focus-ring',
            !shouldShowExpanded && 'justify-center'
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {shouldShowExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                New analysis
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1">
        {conversations.length === 0 ? (
          <AnimatePresence>
            {shouldShowExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground/60">
                  No analyses yet
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'history-item w-full text-left focus-ring',
                  conversation.id === activeConversationId && 'active'
                )}
              >
                {shouldShowExpanded ? (
                  <div className="flex items-start gap-3 w-full">
                    <StatusIndicator status={conversation.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground/90">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center w-full">
                    <StatusIndicator status={conversation.status} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
