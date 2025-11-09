import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import { UploadedPaperPreview } from "./UploadedPaperPreview";

// Use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
      
      // Extract text from all pages
      console.log(`Extracting text from ${pdf.numPages} pages of ${file.name}`);
      
      for (let i = 1; i <= pdf.numPages; i++) {
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
      // Dynamic import to avoid circular dependency
      const { supabase } = await import("@/integrations/supabase/client");

      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        setCurrentParsing(uploadedFile.name);
        
        toast.info(`Parsing ${i + 1}/${uploadedFiles.length}: ${uploadedFile.name}`);

        try {
          // Step 1: Extract text from PDF
          console.log(`Starting to parse: ${uploadedFile.name}`);
          const text = await extractTextFromPdf(uploadedFile.file);
          
          if (!text || text.trim().length === 0) {
            throw new Error("No text could be extracted from PDF");
          }
          
          console.log(`Extracted ${text.length} characters, now analyzing with AI...`);
          toast.info(`Analyzing ${uploadedFile.name} with AI...`);

          // Step 2: Analyze with AI
          const { data: analyzedPaper, error } = await supabase.functions.invoke('analyze-paper', {
            body: { 
              text: text,
              filename: uploadedFile.name 
            }
          });

          if (error) {
            console.error(`AI analysis error for ${uploadedFile.name}:`, error);
            throw new Error(`AI analysis failed: ${error.message}`);
          }

          if (!analyzedPaper) {
            throw new Error("No data returned from AI analysis");
          }

          // Convert AI response to ParsedPaper format
          const paper: ParsedPaper = {
            id: parsedPapers.length + i + 1,
            title: analyzedPaper.title || uploadedFile.name.replace('.pdf', ''),
            abstract: analyzedPaper.abstract || 'No abstract extracted',
            keyFindings: analyzedPaper.keyFindings || 'No key findings extracted',
            methodology: analyzedPaper.methodology || 'No methodology extracted',
            results: analyzedPaper.results || 'No results extracted',
            limitations: analyzedPaper.limitations || 'No limitations extracted',
            year: new Date().getFullYear(),
            source: uploadedFile.name,
            fileName: uploadedFile.name,
            fullText: text
          };

          newPapers.push(paper);
          
          console.log(`Successfully analyzed: ${uploadedFile.name}`);
          toast.success(`✓ Analyzed: ${uploadedFile.name}`);
          
          // Small delay between files to show progress
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
        toast.success(`Successfully analyzed ${newPapers.length} paper(s) with AI!`);
        
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
              Upload PDFs to extract and analyze with AI
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
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Analyze with AI
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
        <UploadedPaperPreview 
          papers={parsedPapers} 
          onRemovePaper={removeParsedPaper} 
        />
      )}
    </div>
  );
};
