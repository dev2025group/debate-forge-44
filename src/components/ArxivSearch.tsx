import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string;
  link: string;
  selected: boolean;
}

interface ArxivSearchProps {
  onPapersSelected: (papers: any[]) => void;
}

export const ArxivSearch = ({ onPapersSelected }: ArxivSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedPapers(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('arxiv-search', {
        body: { query: searchQuery, maxResults: 10 }
      });

      if (error) throw error;

      if (data.papers && data.papers.length > 0) {
        setSearchResults(data.papers);
        toast.success(`Found ${data.papers.length} papers`);
      } else {
        toast.info("No papers found. Try a different query.");
      }
    } catch (error) {
      console.error("arXiv search error:", error);
      toast.error("Failed to search arXiv. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const togglePaperSelection = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const handleAnalyzeSelected = async () => {
    if (selectedPapers.size === 0) {
      toast.error("Please select at least one paper to analyze");
      return;
    }

    setIsAnalyzing(true);
    const selectedPaperData = searchResults.filter(p => selectedPapers.has(p.id));

    try {
      // Analyze each selected paper
      const analyzedPapers = await Promise.all(
        selectedPaperData.map(async (paper) => {
          const { data, error } = await supabase.functions.invoke('analyze-paper', {
            body: {
              text: `${paper.title}\n\n${paper.abstract}`,
              filename: paper.id
            }
          });

          if (error) {
            console.error(`Error analyzing ${paper.id}:`, error);
            return null;
          }

          return {
            ...data,
            id: paper.id,
            arxivLink: paper.link,
            authors: paper.authors,
            published: paper.published
          };
        })
      );

      const validPapers = analyzedPapers.filter(p => p !== null);
      
      if (validPapers.length > 0) {
        onPapersSelected(validPapers);
        toast.success(`${validPapers.length} papers analyzed and ready!`);
        setSearchResults([]);
        setSelectedPapers(new Set());
        setSearchQuery("");
      } else {
        toast.error("Failed to analyze selected papers");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze papers");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search arXiv (e.g., 'microplastics health effects', 'quantum computing')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={isSearching}
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="min-w-[100px]"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <>
          <div className="text-sm text-muted-foreground">
            {selectedPapers.size} of {searchResults.length} papers selected
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {searchResults.map((paper) => (
              <Card
                key={paper.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedPapers.has(paper.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => togglePaperSelection(paper.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {selectedPapers.has(paper.id) ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 border-2 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {paper.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {paper.abstract}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {new Date(paper.published).getFullYear()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {paper.authors[0]}{paper.authors.length > 1 ? " et al." : ""}
                      </Badge>
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on arXiv
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleAnalyzeSelected}
            disabled={selectedPapers.size === 0 || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing {selectedPapers.size} papers...
              </>
            ) : (
              `Analyze Selected (${selectedPapers.size})`
            )}
          </Button>
        </>
      )}
    </div>
  );
};
