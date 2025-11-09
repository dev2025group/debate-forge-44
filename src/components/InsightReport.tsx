import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle2, Lightbulb, FileText } from "lucide-react";

interface InsightReportProps {
  synthesis: any;
  validation: any;
}

const InsightReport = ({ synthesis, validation }: InsightReportProps) => {
  if (!synthesis || !validation) return null;
  
  const handleDownload = () => {
    const report = {
      insight: synthesis.insight,
      confidence: validation.overallConfidence,
      consensusPoints: synthesis.consensusPoints,
      hypothesis: synthesis.hypothesis,
      citations: validation.citations,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-debate-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-synthesizer" />
          Final Research Insight
        </h2>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>
      
      {/* Main Insight Card */}
      <Card className="p-6 bg-gradient-to-br from-synthesizer-bg to-background border-synthesizer">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-synthesizer flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Collective Insight</h3>
              <p className="text-foreground leading-relaxed">{synthesis.insight}</p>
            </div>
          </div>
          
          {/* Confidence Score */}
          <div className="bg-background/50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Evidence Confidence</span>
              <Badge variant={validation.overallConfidence >= 80 ? "default" : "secondary"}>
                {validation.overallConfidence}%
              </Badge>
            </div>
            <Progress value={validation.overallConfidence} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on verification against {validation.citations?.length || 0} source papers
            </p>
          </div>
        </div>
      </Card>
      
      {/* Consensus Points */}
      {synthesis.consensusPoints && synthesis.consensusPoints.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-synthesizer" />
            Points of Agreement
          </h3>
          <ul className="space-y-2">
            {synthesis.consensusPoints.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-synthesizer mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      
      {/* Future Research Hypothesis */}
      {synthesis.hypothesis && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Future Research Direction
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{synthesis.hypothesis}</p>
        </Card>
      )}
      
      {/* Citations */}
      {validation.citations && validation.citations.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-validator" />
            Supporting Evidence
          </h3>
          <div className="space-y-3">
            {validation.citations.map((citation: any, idx: number) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs">Paper {citation.paperId}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{citation.relevantFinding}</p>
                    <p className="text-xs text-muted-foreground italic">
                      → {citation.supportsInsight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default InsightReport;
