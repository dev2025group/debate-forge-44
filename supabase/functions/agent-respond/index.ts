import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_PROMPTS = {
  Researcher: `You are Dr. Research, a meticulous research analyst. Respond in this EXACT JSON format:
{
  "summary": "1-2 sentence overview of your key finding",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "findings": "Main discovery or pattern (2-3 sentences max)",
  "references": ["Paper 1", "Paper 2"]
}
Keep CONCISE. Max 3 key points. Under 200 words total. Always cite paper numbers.`,

  Critic: `You are Dr. Critical, a skeptical peer reviewer. Respond in this EXACT JSON format:
{
  "summary": "1 sentence critique overview",
  "challenges": ["Challenge 1", "Challenge 2"],
  "questions": ["Question 1", "Question 2"],
  "suggestion": "What would strengthen this analysis (1 sentence)"
}
Be specific but brief. Max 2-3 challenges. Focus on methodology and claims.`,

  Synthesizer: `You are Dr. Synthesis, an integrative thinker. Respond in this EXACT JSON format:
{
  "insight": "Your main collective insight from the debate (2-3 sentences)",
  "consensusPoints": ["Agreement 1", "Agreement 2", "Agreement 3"],
  "hypothesis": "Novel research direction suggested by combining these perspectives (1-2 sentences)"
}
Focus on synthesis, not repetition. Under 150 words total. Build bridges between viewpoints.`,

  Validator: `You are Dr. Verify, a fact-checker. Respond in this EXACT JSON format:
{
  "summary": "Validation overview (1 sentence)",
  "verified": ["Claim 1: Supported by Paper X", "Claim 2: Confirmed by Paper Y"],
  "concerns": ["Potential issue 1", "Potential issue 2"],
  "confidence": "High/Medium/Low",
  "citations": ["Paper 1: Specific finding", "Paper 2: Supporting evidence"]
}
Max 3 verified claims, max 2 concerns. Be precise with citations.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, papers, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Agent ${agentType} responding (turn ${conversationHistory.length + 1})`);

    // Build context from papers
    const papersContext = papers.map((p: any, idx: number) => 
      `Paper ${idx + 1}: ${p.title}\n` +
      `Abstract: ${p.abstract}\n` +
      `Methodology: ${p.methodology}\n` +
      `Key Findings: ${p.keyFindings}\n` +
      `Results: ${p.results}\n` +
      `Limitations: ${p.limitations}`
    ).join('\n\n---\n\n');

    // Build conversation context
    const conversationContext = conversationHistory.length > 0
      ? '\n\nPrevious discussion:\n' + 
        conversationHistory.map((msg: any) => 
          `${msg.agent}: ${msg.content}`
        ).join('\n\n')
      : '';

    // Construct user prompt based on agent type and turn
    let userPrompt = '';
    if (agentType === 'Researcher' && conversationHistory.length === 0) {
      userPrompt = `Analyze these ${papers.length} research papers and provide your initial findings:`;
    } else if (agentType === 'Critic') {
      userPrompt = `Review the Researcher's analysis and provide your critical perspective:`;
    } else if (agentType === 'Synthesizer') {
      userPrompt = `After reviewing the debate, synthesize the key insights:`;
    } else if (agentType === 'Validator') {
      userPrompt = `Validate the synthesized conclusions against the source papers:`;
    } else {
      userPrompt = `Continue the discussion with your perspective:`;
    }

    const fullPrompt = userPrompt + '\n\n' + papersContext + conversationContext;

    // Call Lovable AI Gateway
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
            content: AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS] || AGENT_PROMPTS.Researcher
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 350,
        response_format: { type: "json_object" }
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
      throw new Error('Failed to get agent response');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse as JSON for structured output
    let structuredResponse;
    try {
      structuredResponse = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse agent response as JSON:', e);
      // Fallback to plain content
      structuredResponse = { content: content };
    }

    // Determine display content based on agent type
    const displayContent = structuredResponse.summary || 
                          structuredResponse.insight || 
                          structuredResponse.content || 
                          content.substring(0, 200) + '...';

    return new Response(
      JSON.stringify({
        agent: agentType,
        content: displayContent,
        turn: conversationHistory.length + 1,
        timestamp: new Date().toISOString(),
        // Include all structured fields
        ...structuredResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in agent-respond:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
