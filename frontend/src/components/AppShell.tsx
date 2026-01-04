import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarHistory } from './SidebarHistory';
import { ChatStream } from './ChatStream';
import { Composer } from './Composer';
import { EmptyState } from './EmptyState';
import { useConversationStore, useActiveConversation } from '@/stores/conversationStore';

export function AppShell() {
  const {
    conversations,
    activeConversationId,
    isAnalyzing,
    isOffline,
    setActiveConversation,
    startNewConversation,
    sendMessage,
    retryMessage,
    setOffline,
  } = useConversationStore();

  const activeConversation = useActiveConversation();
  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Badge */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="offline-badge"
          >
            Offline
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <SidebarHistory
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversation}
        onNewConversation={startNewConversation}
      />

      {/* Main Content */}
      <main className="min-h-screen pl-sidebar-collapsed pb-24 sm:pb-28">
        {/* Chat Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
          <AnimatePresence mode="wait">
            {hasMessages ? (
              <ChatStream
                key="chat"
                messages={activeConversation.messages}
                onRetry={retryMessage}
              />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Composer */}
      <Composer
        onSend={sendMessage}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}
