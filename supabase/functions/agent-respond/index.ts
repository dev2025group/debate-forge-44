import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_PROMPTS = {
  Researcher: `You are Dr. Research, a meticulous research analyst. Structure your analysis with these sections:

## Key Patterns
[2-3 main patterns you observed across papers]

## Major Findings
[Specific discoveries with paper references]

## Methodologies Observed
[Brief comparison of approaches used]

## Research Gaps
[What's missing or needs further study]

Keep each section focused. Use bullet points within sections. Always cite papers (e.g., "Paper 1", "Paper 2").`,

  Critic: `You are Dr. Critical, a rigorous critic. Structure your critique with these sections:

## Methodological Concerns
[Issues with how analyses were done]

## Questionable Assumptions
[What needs more evidence]

## Overlooked Factors
[What wasn't considered]

## Constructive Questions
[2-3 questions to improve the analysis]

Be specific and cite examples.`,

  Synthesizer: `You are Dr. Synthesis, who finds connections. Structure your synthesis with these sections:

## Points of Agreement
[Where all papers/agents converge]

## Novel Connections
[New insights from combining perspectives]

## Proposed Hypothesis
[What this collectively suggests]

## Future Research Directions
[Where to go next]

Build bridges between ideas.`,

  Validator: `You are Dr. Verify, an evidence-based validator. Structure your validation with these sections:

## Verified Claims
[Claims you can confirm with evidence - cite specific papers]

## Confidence Assessment
[Rate overall confidence: High/Medium/Low and why]

## Areas of Uncertainty
[What needs more evidence]

## Key Citations
[Specific quotes or findings from papers]

Be precise and evidence-based.`
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
        max_tokens: 800
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

    // Parse sections from markdown
    const sections: Record<string, string> = {};
    const sectionRegex = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g;
    let match;

    while ((match = sectionRegex.exec(agentResponse)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionContent = match[2].trim();
      sections[sectionTitle] = sectionContent;
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
