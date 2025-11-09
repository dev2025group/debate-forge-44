import AgentMessage from "./AgentMessage";
import { Loader2 } from "lucide-react";
import { getAgentByName } from "@/debate/ConversationOrchestrator";

interface Message {
  agent: string;
  content: string;
  turn: number;
  timestamp: string;
  [key: string]: any;
}

interface DebateViewerProps {
  conversation: Message[];
  isLoading: boolean;
}

const DebateViewer = ({ conversation, isLoading }: DebateViewerProps) => {
  if (conversation.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Click "Start Analysis" to begin the multi-agent debate</p>
        <p className="text-sm mt-2">Four AI agents will analyze research papers and debate their findings</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Debate Conversation</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Agents deliberating...
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {conversation.map((message, index) => {
          const agent = getAgentByName(message.agent);
          return (
            <AgentMessage
              key={index}
              message={message}
              agentColor={agent?.color || "#666"}
              agentName={agent?.name || message.agent}
              agentRole={agent?.role || "Agent"}
            />
          );
        })}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default DebateViewer;
