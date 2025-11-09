import AgentMessage from "./AgentMessage";
import DebateFlowGraph from "./DebateFlowGraph";
import { Loader2, List, Network } from "lucide-react";
import { getAgentByName } from "@/debate/ConversationOrchestrator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
        <h2 className="text-xl font-semibold">Agent Collaboration</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Agents deliberating...
          </div>
        )}
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="graph" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Flow Graph
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
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
        </TabsContent>
        
        <TabsContent value="graph" className="mt-4">
          <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>Visual Debate Flow:</strong> Each node represents an agent's turn. 
              Arrows show how agents respond to each other. 
              Drag to pan, scroll to zoom, and use controls in the bottom-left.
            </p>
          </div>
          <DebateFlowGraph conversation={conversation} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebateViewer;
