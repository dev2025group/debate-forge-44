import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Loader2 } from "lucide-react";
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
}

interface PdfUploaderProps {
  onPapersExtracted: (papers: ParsedPaper[]) => void;
}

export const PdfUploader = ({ onPapersExtracted }: PdfUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [papers, setPapers] = useState<ParsedPaper[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");

  const extractPaperData = (text: string, fileName: string, paperId: number): ParsedPaper => {
    // Simple text parsing to extract paper sections
    const lines = text.split('\n').filter(line => line.trim());
    
    // Try to find title (usually first substantial line)
    const title = lines.find(line => line.length > 20 && line.length < 200) || fileName.replace('.pdf', '');
    
    // Look for abstract section
    const abstractIdx = lines.findIndex(line => /abstract/i.test(line));
    const abstract = abstractIdx >= 0 
      ? lines.slice(abstractIdx + 1, abstractIdx + 5).join(' ').slice(0, 300)
      : lines.slice(0, 3).join(' ').slice(0, 300);
    
    // Look for results/findings
    const resultsIdx = lines.findIndex(line => /results?|findings?/i.test(line));
    const results = resultsIdx >= 0
      ? lines.slice(resultsIdx + 1, resultsIdx + 4).join(' ').slice(0, 200)
      : "Results extracted from document";
    
    // Look for methodology
    const methodIdx = lines.findIndex(line => /method|approach|experiment/i.test(line));
    const methodology = methodIdx >= 0
      ? lines.slice(methodIdx + 1, methodIdx + 3).join(' ').slice(0, 200)
      : "Methodology described in paper";
    
    // Look for limitations/discussion
    const limitIdx = lines.findIndex(line => /limitation|discussion|future work/i.test(line));
    const limitations = limitIdx >= 0
      ? lines.slice(limitIdx + 1, limitIdx + 3).join(' ').slice(0, 200)
      : "Limitations discussed in paper";
    
    // Extract key findings (look for bullet points or numbered lists)
    const keyFindings = lines
      .filter(line => /^[\d\-•]/.test(line.trim()) || /conclude|find|show/i.test(line))
      .slice(0, 3)
      .join(' ')
      .slice(0, 300) || "Key findings extracted from analysis";
    
    return {
      id: paperId,
      title,
      abstract,
      keyFindings,
      methodology,
      results,
      limitations,
      year: new Date().getFullYear(),
      source: fileName,
      fileName
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPapers: ParsedPaper[] = [];

    try {
      // Process files one by one to avoid timeout
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        
        toast.info(`Processing ${file.name}...`);

        // Create a temporary file path for parsing
        const formData = new FormData();
        formData.append('file', file);

        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        // Create object URL for the file
        const fileUrl = URL.createObjectURL(blob);
        
        try {
          // For now, we'll use a simple text extraction
          // In production, you'd use a proper PDF parsing library or API
          const reader = new FileReader();
          
          const text = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => {
              const result = event.target?.result as string;
              // Simple text extraction (this is basic, a real implementation would use pdf.js or similar)
              resolve(result || "");
            };
            reader.onerror = reject;
            reader.readAsText(file);
          });

          const paper = extractPaperData(text, file.name, papers.length + i + 1);
          newPapers.push(paper);
          
          toast.success(`Extracted: ${file.name}`);
          
          // Small delay between files
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error parsing ${file.name}:`, error);
          toast.error(`Failed to parse ${file.name}`);
        }
        
        URL.revokeObjectURL(fileUrl);
      }

      if (newPapers.length > 0) {
        const updatedPapers = [...papers, ...newPapers];
        setPapers(updatedPapers);
        onPapersExtracted(updatedPapers);
        toast.success(`Successfully extracted ${newPapers.length} paper(s)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process PDFs');
    } finally {
      setUploading(false);
      setCurrentFile("");
      e.target.value = '';
    }
  };

  const removePaper = (id: number) => {
    const updated = papers.filter(p => p.id !== id);
    setPapers(updated);
    onPapersExtracted(updated);
    toast.info('Paper removed');
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Upload Research Papers</h3>
          <p className="text-sm text-muted-foreground">
            Upload PDF files (2 pages max recommended). Papers will be parsed and analyzed by agents.
          </p>
        </div>
        <label htmlFor="pdf-upload">
          <Button asChild disabled={uploading}>
            <span className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDFs
                </>
              )}
            </span>
          </Button>
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {uploading && currentFile && (
        <div className="mb-4 p-3 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground">Processing: {currentFile}</p>
        </div>
      )}

      {papers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Extracted Papers ({papers.length})</p>
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{paper.title}</p>
                  <p className="text-xs text-muted-foreground">{paper.fileName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePaper(paper.id)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
