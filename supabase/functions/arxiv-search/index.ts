import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 10 } = await req.json();
    
    if (!query) {
      throw new Error('Search query is required');
    }

    console.log(`Searching arXiv for: ${query}`);

    // arXiv API endpoint
    const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

    const response = await fetch(arxivUrl);
    const xmlText = await response.text();

    // Parse XML response
    const papers = parseArxivXML(xmlText);

    console.log(`Found ${papers.length} papers`);

    return new Response(
      JSON.stringify({ papers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in arxiv-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseArxivXML(xmlText: string) {
  const papers: any[] = [];
  
  // Extract entries using regex (simple parser for XML)
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = xmlText.match(entryPattern) || [];

  entries.forEach((entry) => {
    try {
      const id = extractTag(entry, 'id');
      const title = extractTag(entry, 'title').replace(/\s+/g, ' ').trim();
      const summary = extractTag(entry, 'summary').replace(/\s+/g, ' ').trim();
      const published = extractTag(entry, 'published');
      
      // Extract all authors
      const authorPattern = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
      const authors: string[] = [];
      let authorMatch;
      while ((authorMatch = authorPattern.exec(entry)) !== null) {
        authors.push(authorMatch[1]);
      }

      papers.push({
        id: id.split('/abs/')[1] || id,
        title,
        abstract: summary,
        authors,
        published,
        link: id,
        selected: false
      });
    } catch (error) {
      console.error('Error parsing entry:', error);
    }
  });

  return papers;
}

function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}
