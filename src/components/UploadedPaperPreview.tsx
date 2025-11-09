import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  FileText, 
  X, 
  Copy, 
  Download, 
  Lightbulb, 
  Microscope, 
  BarChart, 
  AlertCircle,
  ChevronDown,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

interface ParsedPaper {
  id: number;
  title: string;
  abstract: string;
  keyFindings: string;
  methodology: string;
  results: string;
  limitations: string;
  year: number;
  source: string;
  fileName: string;
  fullText: string;
}

interface UploadedPaperPreviewProps {
  papers: ParsedPaper[];
  onRemovePaper: (id: number) => void;
}

export const UploadedPaperPreview = ({ papers, onRemovePaper }: UploadedPaperPreviewProps) => {
  const [expandedText, setExpandedText] = useState<Record<number, boolean>>({});

  const toggleTextExpansion = (paperId: number) => {
    setExpandedText(prev => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  const copyToClipboard = (text: string, paperTitle: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied full text of "${paperTitle}" to clipboard`);
  };

  const downloadFullText = (paper: ParsedPaper) => {
    const content = `Title: ${paper.title}
Source: ${paper.fileName}
Year: ${paper.year}
Extracted: ${new Date().toLocaleDateString()}

=== ABSTRACT ===
${paper.abstract}

=== METHODOLOGY ===
${paper.methodology}

=== KEY FINDINGS ===
${paper.keyFindings}

=== RESULTS ===
${paper.results}

=== LIMITATIONS ===
${paper.limitations}

=== FULL EXTRACTED TEXT ===
${paper.fullText}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.fileName.replace('.pdf', '')}_full_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${paper.fileName.replace('.pdf', '')}_full_text.txt`);
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          Analyzed Papers ({papers.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          View extracted content and download full text
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {papers.map((paper) => {
          const isTextExpanded = expandedText[paper.id] || false;
          const textPreview = paper.fullText.slice(0, 500);
          const shouldShowMore = paper.fullText.length > 500;

          return (
            <AccordionItem 
              key={paper.id} 
              value={`paper-${paper.id}`}
              className="border rounded-lg bg-card"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{paper.title}</p>
                      <p className="text-xs text-muted-foreground">{paper.fileName}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {paper.fullText.length.toLocaleString()} chars
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-2">
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {paper.fileName}
                    </span>
                    <span>•</span>
                    <span>Year: {paper.year}</span>
                    <span>•</span>
                    <span>{paper.fullText.length.toLocaleString()} characters</span>
                  </div>

                  {/* AI-Extracted Sections */}
                  <div className="space-y-3">
                    {/* Abstract */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Abstract</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.abstract}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Methodology */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <Microscope className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Methodology</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.methodology}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Key Findings */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Key Findings</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.keyFindings}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Results */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <BarChart className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Results</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.results}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Limitations */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Limitations</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.limitations}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Full Text Section */}
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Full Extracted Text
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(paper.fullText, paper.title)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFullText(paper)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download TXT
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] w-full rounded-md border bg-muted/30 p-4">
                        <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                          {isTextExpanded ? paper.fullText : textPreview}
                        </pre>
                      </ScrollArea>
                      {shouldShowMore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTextExpansion(paper.id)}
                          className="mt-3 w-full"
                        >
                          {isTextExpanded ? "Show Less" : "Show More"}
                          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isTextExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemovePaper(paper.id)}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Paper from Analysis
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
};
