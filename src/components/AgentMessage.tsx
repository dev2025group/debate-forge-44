import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  agent: string;
  content: string;
  turn: number;
  timestamp: string;
  // Researcher fields
  keyPoints?: string[];
  findings?: string;
  references?: string[];
  // Critic fields
  challenges?: string[];
  questions?: string[];
  suggestion?: string;
  // Synthesizer fields
  insight?: string;
  consensusPoints?: string[];
  hypothesis?: string;
  // Validator fields
  verified?: string[];
  concerns?: string[];
  confidence?: string;
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
  
  const hasDetails = message.findings ||
                     message.hypothesis ||
                     message.questions?.length > 0 ||
                     message.citations?.length > 0 ||
                     message.references?.length > 0 ||
                     message.suggestion;
  
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
          
          {/* Main Content - Summary */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed text-base font-medium">{message.content}</p>
          </div>
          
          {/* Key Points - Researcher */}
          {message.keyPoints && message.keyPoints.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.keyPoints.map((point: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs py-1 px-3">
                  {point}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Consensus Points - Synthesizer */}
          {message.consensusPoints && message.consensusPoints.length > 0 && (
            <div className="bg-synthesizer-bg border border-synthesizer-border rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-synthesizer mb-2">🤝 Points of Agreement</p>
              <ul className="text-sm space-y-1">
                {message.consensusPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-synthesizer mt-0.5">•</span>
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Verified Claims - Validator */}
          {message.verified && message.verified.length > 0 && (
            <div className="bg-validator-bg border border-validator-border rounded-lg p-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-validator">✓ Verified Claims</p>
                {message.confidence && (
                  <Badge variant="outline" className="text-xs">
                    {message.confidence} Confidence
                  </Badge>
                )}
              </div>
              <ul className="text-sm space-y-1">
                {message.verified.map((claim: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-validator mt-0.5">✓</span>
                    <span className="text-foreground">{claim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Concerns - Validator */}
          {message.concerns && message.concerns.length > 0 && (
            <div className="bg-critic-bg border border-critic-border rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-critic mb-2">⚠️ Concerns</p>
              <ul className="text-sm space-y-1">
                {message.concerns.map((concern: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-critic mt-0.5">•</span>
                    <span className="text-foreground">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Challenges - Critic */}
          {message.challenges && message.challenges.length > 0 && (
            <div className="bg-critic-bg border border-critic-border rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-critic mb-2">🔍 Critical Challenges</p>
              <ul className="text-sm space-y-1">
                {message.challenges.map((challenge: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-critic mt-0.5">•</span>
                    <span className="text-foreground">{challenge}</span>
                  </li>
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
                  {message.findings && (
                    <div>
                      <p className="font-medium mb-2">📊 Detailed Findings:</p>
                      <p className="text-muted-foreground">{message.findings}</p>
                    </div>
                  )}
                  
                  {message.hypothesis && (
                    <div>
                      <p className="font-medium mb-2">🔬 Research Hypothesis:</p>
                      <p className="text-muted-foreground">{message.hypothesis}</p>
                    </div>
                  )}
                  
                  {message.suggestion && (
                    <div>
                      <p className="font-medium mb-2">💡 Suggestion:</p>
                      <p className="text-muted-foreground">{message.suggestion}</p>
                    </div>
                  )}
                  
                  {message.questions && message.questions.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">❓ Discussion Questions:</p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        {message.questions.map((q: string, idx: number) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.citations && message.citations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">📚 Citations:</p>
                      <div className="space-y-2">
                        {message.citations.map((citation: any, idx: number) => (
                          <div key={idx} className="bg-background rounded p-2 text-xs">
                            <p className="text-muted-foreground">{citation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.references && message.references.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">📄 References:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.references.map((ref: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ref}
                          </Badge>
                        ))}
                      </div>
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
