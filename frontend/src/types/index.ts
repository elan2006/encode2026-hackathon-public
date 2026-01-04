export type MessageRole = "user" | "assistant";

export type ConversationStatus = "done" | "analyzing" | "failed";

export interface Attachment {
  type: "image" | "barcode";
  value: string; // base64 for image, barcode string for barcode
  fileName?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Updated artifact structure: Verdict-first format
export interface InsightArtifact {
  verdict?: string; // One sentence. Brutally clear.
  keyFindings?: string[]; // Never more than 3 bullets
  whoShouldCare?: string; // Specific humans, not personas
  theCatch?: string; // What's being traded off
  bottomLine?: string; // Binary. Actionable. Clear.
}

export interface AnalyzeRequest {
  message: string;
  image?: string;
  barcode?: string;
  conversationId?: string;
  history?: Message[];
}

export interface AnalyzeResponse {
  conversationId: string;
  artifactMarkdown: string;
  raw?: Record<string, unknown>;
}
