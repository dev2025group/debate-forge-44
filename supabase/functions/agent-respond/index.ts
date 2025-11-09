import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_PROMPTS = {
  Researcher: `You are Dr. Research, a meticulous research analyst.

CRITICAL: You MUST format your response using EXACTLY this structure with ## headers:

## Key Patterns
- Pattern 1 (cite papers)
- Pattern 2 (cite papers)

## Major Findings
- Finding 1 with Paper X reference
- Finding 2 with Paper Y reference

## Methodologies Observed
- Brief methodology comparison

## Research Gaps
- Gap 1
- Gap 2

RULES:
- Start EVERY section with ## followed by exact section name
- Use bullet points (- or *) within sections
- Keep CONCISE - max 2-3 bullets per section
- DO NOT use **bold text** for section headers
- DO NOT write paragraphs - use bullets

EXAMPLE:
## Key Patterns
- All papers show ubiquitous microplastic presence (Papers 1, 2, 3)
- Primary human exposure through oral intake`,

  Critic: `You are Dr. Critical, a rigorous critic.

CRITICAL: You MUST format your response using EXACTLY this structure with ## headers:

## Methodological Concerns
- Concern 1
- Concern 2

## Questionable Assumptions
- Assumption 1 that needs evidence
- Assumption 2 that needs evidence

## Overlooked Factors
- Factor 1
- Factor 2

## Constructive Questions
- Question 1?
- Question 2?

RULES:
- Start EVERY section with ## followed by exact section name
- Use bullet points only
- Keep brief - max 2-3 bullets per section
- DO NOT use **bold text** for headers
- DO NOT write long paragraphs

EXAMPLE:
## Methodological Concerns
- "Significant potential" overstates certainty from review-level evidence
- Primary route claim lacks dose quantification across populations`,

  Synthesizer: `You are Dr. Synthesis, who finds connections.

CRITICAL: You MUST format your response using EXACTLY this structure with ## headers:

## Points of Agreement
- Agreement 1
- Agreement 2
- Agreement 3

## Novel Connections
- Connection 1 between papers/agents
- Connection 2 between papers/agents

## Proposed Hypothesis
- Hypothesis based on synthesis

## Future Research Directions
- Direction 1
- Direction 2

RULES:
- Start EVERY section with ## followed by exact section name
- Use bullet points only
- Max 3 bullets per section
- DO NOT use **bold text**
- Focus on synthesis, not repetition

EXAMPLE:
## Points of Agreement
- All papers confirm ubiquitous MP presence in environment and human body
- Inflammation and oxidative stress are key mechanisms`,

  Validator: `You are Dr. Verify, an evidence-based validator.

CRITICAL: You MUST format your response using EXACTLY this structure with ## headers:

## Verified Claims
- ✓ Claim 1 (cite Paper X, page/section)
- ✓ Claim 2 (cite Paper Y, page/section)

## Confidence Assessment
- Overall confidence: High/Medium/Low
- Reasoning in 1 sentence

## Areas of Uncertainty
- Uncertainty 1
- Uncertainty 2

## Key Citations
- Paper X: "quote" supports claim Y
- Paper Z: "quote" supports claim W

RULES:
- Start EVERY section with ## followed by exact section name
- Use bullet points only
- Max 3 items per section
- Always cite specific papers
- DO NOT use **bold text**

EXAMPLE:
## Verified Claims
- ✓ MPs detected in human placenta (Paper 1, Key Findings)
- ✓ Oral intake is primary exposure route (Paper 2, Abstract)`
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
        max_tokens: 450
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
    const agentResponse = data.choices[0].message.content;

    console.log(`Response from ${agentType}, length: ${agentResponse.length}`);

    // Parse sections - try multiple formats
    const sections: Record<string, string> = {};

    // Strategy 1: Try ## markdown headers first (preferred)
    let sectionRegex = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g;
    let match;

    while ((match = sectionRegex.exec(agentResponse)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionContent = match[2].trim();
      sections[sectionTitle] = sectionContent;
    }

    console.log(`Found ${Object.keys(sections).length} sections with ## format`);

    // Strategy 2: If no ## sections, try **Bold:** format
    if (Object.keys(sections).length === 0) {
      console.log('No ## sections found, trying **bold:** format');
      const boldRegex = /\*\*(.+?):\*\*\s*\n([\s\S]*?)(?=\n\*\*|\n\d+\.|$)/g;
      
      while ((match = boldRegex.exec(agentResponse)) !== null) {
        const sectionTitle = match[1].trim();
        const sectionContent = match[2].trim();
        // Only add if content is substantial
        if (sectionContent.length > 20) {
          sections[sectionTitle] = sectionContent;
        }
      }
      
      console.log(`Found ${Object.keys(sections).length} sections with **bold:** format`);
    }

    // Strategy 3: If still nothing, try numbered sections like "1. **Title:**"
    if (Object.keys(sections).length === 0) {
      console.log('Trying numbered format');
      const numberedRegex = /\d+\.\s+\*\*(.+?):\*\*\s*([\s\S]*?)(?=\n\d+\.|\n\n\*\*|$)/g;
      
      while ((match = numberedRegex.exec(agentResponse)) !== null) {
        const sectionTitle = match[1].trim();
        const sectionContent = match[2].trim();
        if (sectionContent.length > 20) {
          sections[sectionTitle] = sectionContent;
        }
      }
      
      console.log(`Found ${Object.keys(sections).length} sections with numbered format`);
    }

    // If still no sections, log the start of response for debugging
    if (Object.keys(sections).length === 0) {
      console.warn('WARNING: No sections found in any format!');
      console.log('First 300 chars:', agentResponse.substring(0, 300));
    }

    return new Response(
      JSON.stringify({
        agent: agentType,
        content: agentResponse,
        sections: Object.keys(sections).length > 0 ? sections : undefined,
        turn: conversationHistory.length + 1,
        timestamp: new Date().toISOString()
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
