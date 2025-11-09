import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - using jsdelivr CDN which is more reliable
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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

interface UploadedFile {
  file: File;
  id: string;
  name: string;
}

interface PdfUploaderProps {
  onPapersExtracted: (papers: ParsedPaper[]) => void;
}

export const PdfUploader = ({ onPapersExtracted }: PdfUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [parsing, setParsing] = useState(false);
  const [currentParsing, setCurrentParsing] = useState<string>("");
  const [parsedPapers, setParsedPapers] = useState<ParsedPaper[]>([]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page (limit to first 10 pages to avoid timeout)
      const maxPages = Math.min(pdf.numPages, 10);
      console.log(`Extracting text from ${maxPages} pages of ${file.name}`);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      console.log(`Successfully extracted ${fullText.length} characters from ${file.name}`);
      return fullText;
    } catch (error) {
      console.error(`PDF extraction error for ${file.name}:`, error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const extractPaperData = (text: string, fileName: string, paperId: number): ParsedPaper => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const fullText = text.toLowerCase();
    
    // Extract title (usually near the start, capitalized, longer line)
    const titleCandidates = lines.slice(0, 10).filter(line => 
      line.length > 20 && line.length < 200 && /[A-Z]/.test(line)
    );
    const title = titleCandidates[0] || fileName.replace('.pdf', '');
    
    // Find abstract
    const abstractStart = lines.findIndex(line => 
      /abstract|summary/i.test(line)
    );
    const abstract = abstractStart >= 0 
      ? lines.slice(abstractStart + 1, abstractStart + 6)
          .join(' ')
          .slice(0, 400)
          .trim()
      : lines.slice(0, 5).join(' ').slice(0, 400).trim();
    
    // Find results/findings
    const resultsStart = lines.findIndex(line => 
      /^results?$|^findings?$|^outcomes?$/i.test(line.trim())
    );
    const results = resultsStart >= 0
      ? lines.slice(resultsStart + 1, resultsStart + 5)
          .join(' ')
          .slice(0, 300)
          .trim()
      : "Results section not clearly identified";
    
    // Find methodology
    const methodStart = lines.findIndex(line => 
      /^method|^methodology|^approach|^experimental/i.test(line.trim())
    );
    const methodology = methodStart >= 0
      ? lines.slice(methodStart + 1, methodStart + 4)
          .join(' ')
          .slice(0, 300)
          .trim()
      : "Methodology section not clearly identified";
    
    // Find limitations
    const limitStart = lines.findIndex(line => 
      /limitation|constraint|challenge|future work/i.test(line)
    );
    const limitations = limitStart >= 0
      ? lines.slice(limitStart + 1, limitStart + 4)
          .join(' ')
          .slice(0, 250)
          .trim()
      : "Limitations not explicitly stated";
    
    // Extract key findings (look for numbered points, percentages, or conclusion statements)
    const findingsLines = lines.filter(line => 
      /\d+%|\d+\.\d+|conclude|demonstrate|show that|found that|achieve/i.test(line)
    ).slice(0, 4);
    const keyFindings = findingsLines.length > 0
      ? findingsLines.join(' ').slice(0, 350).trim()
      : "Key findings extracted from full text";
    
    // Try to extract year
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    
    return {
      id: paperId,
      title,
      abstract,
      keyFindings,
      methodology,
      results,
      limitations,
      year,
      source: fileName,
      fileName,
      fullText: text.slice(0, 5000) // Store first 5000 chars for agent analysis
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file, idx) => ({
      file,
      id: `${Date.now()}-${idx}`,
      name: file.name
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) uploaded. Click "Parse PDFs" to extract data.`);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast.info('File removed');
  };

  const parseAllFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files to parse");
      return;
    }

    setParsing(true);
    const newPapers: ParsedPaper[] = [];

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        setCurrentParsing(uploadedFile.name);
        
        toast.info(`Parsing ${i + 1}/${uploadedFiles.length}: ${uploadedFile.name}`);

        try {
          console.log(`Starting to parse: ${uploadedFile.name}`);
          const text = await extractTextFromPdf(uploadedFile.file);
          
          if (!text || text.trim().length === 0) {
            throw new Error("No text could be extracted from PDF");
          }
          
          const paper = extractPaperData(text, uploadedFile.name, parsedPapers.length + i + 1);
          newPapers.push(paper);
          
          console.log(`Successfully parsed: ${uploadedFile.name}`);
          toast.success(`✓ Extracted: ${uploadedFile.name}`);
          
          // Small delay between files to show progress
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (error) {
          console.error(`Error parsing ${uploadedFile.name}:`, error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to parse ${uploadedFile.name}: ${errorMsg}`);
        }
      }

      if (newPapers.length > 0) {
        const updatedPapers = [...parsedPapers, ...newPapers];
        setParsedPapers(updatedPapers);
        onPapersExtracted(updatedPapers);
        toast.success(`Successfully parsed ${newPapers.length} paper(s)!`);
        
        // Clear uploaded files after successful parsing
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Parsing error:', error);
      toast.error('Failed to parse PDFs');
    } finally {
      setParsing(false);
      setCurrentParsing("");
    }
  };

  const removeParsedPaper = (id: number) => {
    const updated = parsedPapers.filter(p => p.id !== id);
    setParsedPapers(updated);
    onPapersExtracted(updated);
    toast.info('Paper removed from analysis');
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Upload Research Papers</h3>
            <p className="text-sm text-muted-foreground">
              Step 1: Upload PDF files (2-3 pages recommended for best results)
            </p>
          </div>
          <label htmlFor="pdf-upload">
            <Button asChild disabled={parsing}>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload PDFs
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
            disabled={parsing}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</p>
              <Button
                onClick={parseAllFiles}
                disabled={parsing}
                size="sm"
                className="gap-2"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Parse All PDFs
                  </>
                )}
              </Button>
            </div>

            {parsing && currentParsing && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm font-medium">Currently parsing: {currentParsing}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={parsing}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedFiles.length === 0 && parsedPapers.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload PDF research papers to begin</p>
          </div>
        )}
      </Card>

      {parsedPapers.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Parsed Papers ({parsedPapers.length})</h3>
            <p className="text-sm text-muted-foreground">
              Ready for agent analysis
            </p>
          </div>
          <div className="space-y-3">
            {parsedPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-4 bg-primary/5 rounded-lg border border-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-semibold truncate">{paper.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {paper.abstract}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Source: {paper.fileName}</span>
                      <span>•</span>
                      <span>Year: {paper.year}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParsedPaper(paper.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
