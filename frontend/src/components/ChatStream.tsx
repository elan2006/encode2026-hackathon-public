import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Message, Attachment } from "@/types";
import { ArtifactCard, ArtifactLoading, ArtifactError } from "./ArtifactCard";
import { cn } from "@/lib/utils";
import { Image, Barcode, User, Sparkles } from "lucide-react";

interface ChatStreamProps {
  messages: Message[];
  onRetry: (messageId: string) => void;
  className?: string;
}

function AttachmentChip({ attachment }: { attachment: Attachment }) {
  return (
    <span className="attachment-chip">
      {attachment.type === "image" ? (
        <>
          <Image className="w-3 h-3" />
          <span>{attachment.fileName || "Image"}</span>
        </>
      ) : (
        <>
          <Barcode className="w-3 h-3" />
          <span className="font-mono">{attachment.value.slice(0, 13)}</span>
        </>
      )}
    </span>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-4"
    >
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 pt-1.5">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att, idx) => (
              <AttachmentChip key={idx} attachment={att} />
            ))}
          </div>
        )}
        <p className="text-[15px] text-foreground whitespace-pre-wrap leading-relaxed">
          {message.content ||
            (message.attachments?.length ? "Analyze this product" : "")}
        </p>
      </div>
    </motion.div>
  );
}

interface AssistantMessageProps {
  message: Message;
  onRetry: () => void;
}

function AssistantMessage({ message, onRetry }: AssistantMessageProps) {
  if (message.isLoading) {
    return <ArtifactLoading />;
  }

  if (message.error) {
    return <ArtifactError error={message.error} onRetry={onRetry} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-4"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0 pt-1.5">
        <ArtifactCard markdown={message.content} />
      </div>
    </motion.div>
  );
}

export function ChatStream({ messages, onRetry, className }: ChatStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-8", className)}
    >
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AssistantMessage
              message={message}
              onRetry={() => onRetry(message.id)}
            />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </motion.div>
  );
}
