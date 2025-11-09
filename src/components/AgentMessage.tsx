import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  agent: string;
  content: string;
  sections?: Record<string, string>;
  turn: number;
  timestamp: string;
  reasoning?: string[];
  analysis?: any;
  challenges?: string[];
  questions?: string[];
  insight?: string;
  citations?: any[];
  [key: string]: any;
}

interface AgentMessageProps {
  message: Message;
  agentColor: string;
  agentName: string;
  agentRole: string;
}

const AgentMessage = ({ message, agentColor, agentName, agentRole }: AgentMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getAgentColorClass = (agent: string) => {
    switch (agent) {
      case "Researcher": return "border-researcher bg-researcher-bg";
      case "Critic": return "border-critic bg-critic-bg";
      case "Synthesizer": return "border-synthesizer bg-synthesizer-bg";
      case "Validator": return "border-validator bg-validator-bg";
      default: return "border-border bg-card";
    }
  };
  
  const getAgentInitial = (agent: string) => agent.charAt(0);
  
  const getSectionIcon = (title: string) => {
    if (title.includes('Pattern') || title.includes('Finding')) return '🔍';
    if (title.includes('Gap') || title.includes('Missing')) return '⚠️';
    if (title.includes('Method')) return '🔬';
    if (title.includes('Question') || title.includes('Concern')) return '❓';
    if (title.includes('Agreement') || title.includes('Consensus')) return '✅';
    if (title.includes('Connection') || title.includes('Insight')) return '💡';
    if (title.includes('Hypothesis') || title.includes('Direction')) return '🎯';
    if (title.includes('Verified') || title.includes('Confirm')) return '✓';
    if (title.includes('Confidence')) return '📊';
    if (title.includes('Citation') || title.includes('Reference')) return '📚';
    if (title.includes('Uncertainty')) return '🤔';
    return '📄';
  };
  
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return `<li class="ml-4 mb-1">${trimmed.substring(1).trim()}</li>`;
        }
        if (trimmed) {
          return `<p class="mb-2">${trimmed}</p>`;
        }
        return '';
      })
      .join('');
  };
  
  const hasDetails = message.reasoning?.length > 0 || 
                     message.analysis || 
                     message.challenges?.length > 0 ||
                     message.questions?.length > 0 ||
                     message.citations?.length > 0;
  
  return (
    <Card className={cn(
      "p-6 border-l-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
      getAgentColorClass(message.agent)
    )}>
      <div className="flex gap-4">
        {/* Agent Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: agentColor }}
        >
          {getAgentInitial(message.agent)}
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Agent Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{agentName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {agentRole}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Turn {message.turn} • {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {/* Main Content */}
          {message.sections ? (
            <div className="space-y-4 mt-4">
              {Object.entries(message.sections).map(([title, content]) => (
                <div 
                  key={title}
                  className="bg-muted/30 rounded-lg p-4 border border-border/50"
                >
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                    <span>{getSectionIcon(title)}</span>
                    <span>{title}</span>
                  </h4>
                  <div 
                    className="prose prose-sm max-w-none text-foreground/90 leading-relaxed [&_li]:text-foreground/90 [&_p]:text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed">{message.content}</p>
            </div>
          )}
          
          {/* Special Content Blocks */}
          {message.insight && (
            <div className="bg-synthesizer-bg border border-synthesizer-border rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-synthesizer mb-2">💡 Collective Insight</p>
              <p className="text-sm text-foreground">{message.insight}</p>
            </div>
          )}
          
          {message.challenges && message.challenges.length > 0 && (
            <div className="bg-critic-bg border border-critic-border rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-critic mb-2">⚠️ Challenges Raised</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {message.challenges.slice(0, 2).map((challenge: string, idx: number) => (
                  <li key={idx} className="text-foreground">{challenge}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Expandable Details */}
          {hasDetails && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {isExpanded ? "Hide" : "Show"} Details
              </Button>
              
              {isExpanded && (
                <div className="mt-3 space-y-3 text-sm bg-muted/50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {message.reasoning && message.reasoning.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Reasoning Steps:</p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        {message.reasoning.map((step: string, idx: number) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.questions && message.questions.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Questions for Discussion:</p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        {message.questions.map((q: string, idx: number) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.citations && message.citations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Citations:</p>
                      <div className="space-y-2">
                        {message.citations.map((citation: any, idx: number) => (
                          <div key={idx} className="bg-background rounded p-2">
                            <p className="text-xs font-medium">Paper {citation.paperId}</p>
                            <p className="text-xs text-muted-foreground mt-1">{citation.relevantFinding}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.references && message.references.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">References:</p>
                      <p className="text-muted-foreground">Papers {message.references.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AgentMessage;
