import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PdfExportProps {
  conversation: any[];
  debateResult: any;
  papers: any[];
  graphRef?: React.RefObject<HTMLDivElement>;
}

export const PdfExport = ({ conversation, debateResult, papers, graphRef }: PdfExportProps) => {
  const exportToPdf = async () => {
    if (conversation.length === 0) {
      toast.error("No debate data to export");
      return;
    }

    toast.info("Generating PDF report...");

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('AI Research Agent Debate Report', margin, yPosition);
      yPosition += 10;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Papers Analyzed: ${papers.length}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Agent Turns: ${conversation.length}`, margin, yPosition);
      yPosition += 15;

      // Papers section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Research Papers', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      papers.forEach((paper, idx) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        
        const paperTitle = `${idx + 1}. ${paper.title || 'Untitled'}`;
        const titleLines = pdf.splitTextToSize(paperTitle, pageWidth - 2 * margin);
        pdf.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 4 + 3;
      });

      yPosition += 10;

      // Debate Flow Graph (if available)
      if (graphRef?.current) {
        try {
          pdf.addPage();
          yPosition = margin;
          
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          pdf.text('Agent Debate Flow Visualization', margin, yPosition);
          yPosition += 10;

          const graphImage = await toPng(graphRef.current, { 
            quality: 0.95,
            pixelRatio: 2 
          });
          
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = 120; // Fixed height for the graph
          pdf.addImage(graphImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error capturing graph:', error);
        }
      }

      // Agent Conversation
      pdf.addPage();
      yPosition = margin;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Agent Debate Transcript', margin, yPosition);
      yPosition += 10;

      conversation.forEach((message, idx) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Agent name and turn
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${message.agent} - Turn ${message.turn}`, margin, yPosition);
        yPosition += 6;

        // Sections
        if (message.sections) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          
          Object.entries(message.sections).forEach(([title, content]) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.setFont(undefined, 'bold');
            pdf.text(`  ${title}:`, margin, yPosition);
            yPosition += 5;

            pdf.setFont(undefined, 'normal');
            const contentLines = pdf.splitTextToSize(
              String(content).substring(0, 300), // Limit content length
              pageWidth - 2 * margin - 5
            );
            pdf.text(contentLines.slice(0, 8), margin + 5, yPosition); // Max 8 lines per section
            yPosition += contentLines.slice(0, 8).length * 4 + 3;
          });
        }

        yPosition += 8;
      });

      // Final Insights
      if (debateResult?.finalInsight) {
        pdf.addPage();
        yPosition = margin;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Final Collective Insight', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const insightLines = pdf.splitTextToSize(
          debateResult.finalInsight,
          pageWidth - 2 * margin
        );
        pdf.text(insightLines, margin, yPosition);
      }

      // Save the PDF
      const filename = `research-debate-${new Date().getTime()}.pdf`;
      pdf.save(filename);
      
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <Button
      onClick={exportToPdf}
      disabled={conversation.length === 0}
      variant="outline"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Export as PDF
    </Button>
  );
};
