import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebateViewer from "@/components/DebateViewer";
import InsightReport from "@/components/InsightReport";
import { runDebate, agentsList } from "@/debate/ConversationOrchestrator";
import { researchPapers } from "@/data/researchPapers";
import { PlayCircle, Users, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [conversation, setConversation] = useState<any[]>([]);
  const [debateResult, setDebateResult] = useState<any>(null);
  const [isDebating, setIsDebating] = useState(false);
  
  const startDebate = async () => {
    setIsDebating(true);
    setConversation([]);
    setDebateResult(null);
    
    toast.info("Debate started! Agents are analyzing research papers...");
    
    const result = await runDebate(researchPapers, (updatedConversation) => {
      setConversation(updatedConversation);
    });
    
    setDebateResult(result);
    setIsDebating(false);
    
    if (result.success) {
      toast.success("Debate complete! Collective insight generated.");
    } else {
      toast.error("Debate encountered an error.");
    }
  };
  
  const synthesisMessage = conversation.find(m => m.agent === "Synthesizer");
  const validationMessage = conversation.find(m => m.agent === "Validator");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold">Research Agent</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Multi-Agent Debate System: AI agents collaboratively analyze research papers through structured debate, 
                challenging claims and synthesizing collective insights
              </p>
            </div>
            <Button 
              onClick={startDebate} 
              disabled={isDebating}
              size="lg"
              className="gap-2"
            >
              {isDebating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Agent Cards */}
        {conversation.length === 0 && !isDebating && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">The Research Team</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentsList.map((agent, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold mb-1">{agent.name}</h3>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {agent.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{agent.personality}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Research Papers Info */}
        {conversation.length === 0 && !isDebating && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-background">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Research Topic: AI for Climate Modeling</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Agents will analyze {researchPapers.length} research papers comparing laboratory studies, 
                  real-world deployments, and hybrid approaches to AI-powered climate prediction systems.
                </p>
                <div className="flex flex-wrap gap-2">
                  {researchPapers.map(paper => (
                    <Badge key={paper.id} variant="outline" className="text-xs">
                      Paper {paper.id}: {paper.year}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Debate Viewer */}
        <DebateViewer conversation={conversation} isLoading={isDebating} />
        
        {/* Insight Report */}
        {!isDebating && synthesisMessage && validationMessage && (
          <InsightReport synthesis={synthesisMessage} validation={validationMessage} />
        )}
      </main>
      
      <footer className="border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Multi-Agent Research Debate System • Built with modular agent architecture</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
