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
    const { text, filename } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing paper: ${filename}`);

    // Use Gemini to extract structured data from the paper
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a research paper analyzer. Extract structured information from academic papers.
Return a JSON object with these fields:
- title: The paper's title
- abstract: A concise abstract (2-3 sentences)
- methodology: The research methodology used
- keyFindings: Main findings (2-3 key points)
- results: Detailed results
- limitations: Any limitations mentioned

Be concise and factual. Only extract information that is explicitly stated in the paper.`
          },
          {
            role: 'user',
            content: `Analyze this research paper and extract structured data:\n\n${text.slice(0, 8000)}`
          }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze paper with AI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let structuredData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      structuredData = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback: create basic structure
      structuredData = {
        title: filename,
        abstract: 'Unable to extract abstract',
        methodology: 'Unable to extract methodology',
        keyFindings: 'Unable to extract key findings',
        results: 'Unable to extract results',
        limitations: 'Unable to extract limitations'
      };
    }

    return new Response(
      JSON.stringify({
        ...structuredData,
        id: filename,
        rawText: text.slice(0, 5000) // Keep some raw text for reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-paper:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
