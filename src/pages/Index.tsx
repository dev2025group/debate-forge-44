import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DebateViewer from "@/components/DebateViewer";
import InsightReport from "@/components/InsightReport";
import { PdfUploader } from "@/components/PdfUploader";
import { ArxivSearch } from "@/components/ArxivSearch";
import { runDebate, agentsList } from "@/debate/ConversationOrchestrator";
import { researchPapers } from "@/data/researchPapers";
import { PlayCircle, Users, FileText, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [conversation, setConversation] = useState<any[]>([]);
  const [debateResult, setDebateResult] = useState<any>(null);
  const [isDebating, setIsDebating] = useState(false);
  const [uploadedPapers, setUploadedPapers] = useState<any[]>([]);
  const [arxivPapers, setArxivPapers] = useState<any[]>([]);
  const [paperSource, setPaperSource] = useState<"sample" | "uploaded" | "arxiv">("sample");
  
  const startDebate = async () => {
    let papers;
    if (paperSource === "arxiv") {
      papers = arxivPapers;
    } else if (paperSource === "uploaded") {
      papers = uploadedPapers;
    } else {
      papers = researchPapers;
    }
    
    if (papers.length === 0) {
      toast.error("Please select or upload at least one research paper first.");
      return;
    }
    
    setIsDebating(true);
    setConversation([]);
    setDebateResult(null);
    
    toast.info("Debate started! Agents are analyzing research papers...");
    
    const result = await runDebate(papers, (updatedConversation) => {
      setConversation([...updatedConversation]);
    });
    
    setDebateResult(result);
    setIsDebating(false);
    
    if (result.success) {
      toast.success("Debate complete! Collective insight generated.");
    } else {
      toast.error("Debate encountered an error.");
    }
  };

  const handlePapersExtracted = (papers: any[]) => {
    setUploadedPapers(papers);
    setPaperSource("uploaded");
  };

  const handleArxivPapersSelected = (papers: any[]) => {
    setArxivPapers(papers);
    setPaperSource("arxiv");
  };

  const activePapers = paperSource === "arxiv" ? arxivPapers : 
                       paperSource === "uploaded" ? uploadedPapers : 
                       researchPapers;
  
  // Helper functions to extract structured data from agent sections
  const extractBulletPoints = (sectionText: string | undefined): string[] => {
    if (!sectionText) return [];
    return sectionText
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))
      .map(line => line.trim().substring(1).trim())
      .filter(point => point.length > 0);
  };

  const extractConfidence = (sectionText: string | undefined): number => {
    if (!sectionText) return 75;
    const match = sectionText.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 75;
  };
  
  const synthesisMessage = conversation.find(m => m.agent === "Synthesizer");
  const validationMessage = conversation.find(m => m.agent === "Validator");
  
  // Transform messages into structured data for InsightReport
  const transformedSynthesis = synthesisMessage ? {
    insight: extractBulletPoints(synthesisMessage.sections?.["Points of Agreement"])?.[0] || 
             extractBulletPoints(synthesisMessage.sections?.["Novel Connections"])?.[0] ||
             synthesisMessage.content.substring(0, 300) + "...",
    consensusPoints: extractBulletPoints(synthesisMessage.sections?.["Points of Agreement"]),
    hypothesis: synthesisMessage.sections?.["Proposed Hypothesis"] || 
                synthesisMessage.sections?.["Future Research Directions"] ||
                "",
    fullContent: synthesisMessage.content
  } : null;

  const transformedValidation = validationMessage ? {
    overallConfidence: extractConfidence(validationMessage.sections?.["Confidence Assessment"] || validationMessage.content),
    citations: activePapers.map((p, idx) => ({
      paperId: idx + 1,
      title: p.title,
      relevantFinding: p.keyFindings || "Key finding from paper",
      supportsInsight: "Verified against paper findings"
    })),
    verified: extractBulletPoints(validationMessage.sections?.["Verified Claims"]),
    concerns: extractBulletPoints(validationMessage.sections?.["Areas of Uncertainty"]),
    fullContent: validationMessage.content
  } : null;
  
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
        
        {/* Paper Source Tabs */}
        {conversation.length === 0 && !isDebating && (
          <Tabs value={paperSource} onValueChange={(v) => setPaperSource(v as "sample" | "uploaded" | "arxiv")} className="mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="sample">Sample Papers</TabsTrigger>
              <TabsTrigger value="uploaded">Upload PDFs</TabsTrigger>
              <TabsTrigger value="arxiv">
                <Search className="w-4 h-4 mr-1" />
                arXiv Search
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sample">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
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
            </TabsContent>
            
            <TabsContent value="uploaded">
              <PdfUploader onPapersExtracted={handlePapersExtracted} />
              {uploadedPapers.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Your Uploaded Papers</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {uploadedPapers.length} papers ready for agent analysis
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedPapers.map(paper => (
                          <Badge key={paper.id} variant="outline" className="text-xs">
                            {paper.fileName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="arxiv">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Search arXiv Repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Search arXiv for research papers on any topic. Select papers to analyze.
                  </p>
                </div>
                <ArxivSearch onPapersSelected={handleArxivPapersSelected} />
              </Card>
              {arxivPapers.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-background mt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Selected arXiv Papers</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {arxivPapers.length} papers ready for agent analysis
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {arxivPapers.map(paper => (
                          <Badge key={paper.id} variant="outline" className="text-xs">
                            {paper.title?.substring(0, 50)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Debate Viewer */}
        <DebateViewer 
          conversation={conversation} 
          isLoading={isDebating}
          debateResult={debateResult}
          papers={activePapers}
        />
        
        {/* Insight Report */}
        {!isDebating && transformedSynthesis && transformedValidation && (
          <InsightReport 
            synthesis={transformedSynthesis} 
            validation={transformedValidation}
            papers={activePapers}
          />
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
