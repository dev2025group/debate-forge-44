import { supabase } from "@/integrations/supabase/client";

// Agent metadata (no logic, just presentation data)
const agentMetadata = {
  Researcher: {
    name: "Dr. Research",
    color: "#3B82F6",
    role: "Research Analyst",
    personality: "Thorough and analytical"
  },
  Critic: {
    name: "Dr. Critical",
    color: "#EF4444",
    role: "Critical Reviewer",
    personality: "Skeptical and rigorous"
  },
  Synthesizer: {
    name: "Dr. Synthesis",
    color: "#10B981",
    role: "Insight Generator",
    personality: "Balanced and integrative"
  },
  Validator: {
    name: "Dr. Verify",
    color: "#8B5CF6",
    role: "Evidence Checker",
    personality: "Precise and factual"
  }
};

export const agentsList = Object.entries(agentMetadata).map(([key, data]) => ({
  ...data,
  agent: key
}));

export const getAgentByName = (agentName) => {
  return agentMetadata[agentName] || null;
};

/**
 * Orchestrates a multi-turn AI-powered debate between agents
 * @param {Array} papers - Array of analyzed paper objects
 * @param {Function} onUpdate - Callback for progress updates
 * @returns {Promise<Object>} Debate results with conversation and insights
 */
export const runDebate = async (papers, onUpdate) => {
  try {
    const conversation = [];
    
    // Define the debate sequence
    const debateSequence = [
      { agent: 'Researcher', description: 'Initial analysis' },
      { agent: 'Critic', description: 'Critical review' },
      { agent: 'Researcher', description: 'Response to criticism' },
      { agent: 'Critic', description: 'Follow-up critique' },
      { agent: 'Synthesizer', description: 'Synthesizing insights' },
      { agent: 'Validator', description: 'Validating conclusions' }
    ];

    // Run the debate
    for (let i = 0; i < debateSequence.length; i++) {
      const { agent, description } = debateSequence[i];
      
      onUpdate?.({
        message: `${agent} ${description}...`,
        progress: ((i + 1) / debateSequence.length) * 100
      });

      // Call the agent-respond edge function
      const { data, error } = await supabase.functions.invoke('agent-respond', {
        body: {
          agentType: agent,
          papers: papers,
          conversationHistory: conversation
        }
      });

      if (error) {
        console.error(`Error from ${agent}:`, error);
        throw new Error(`${agent} failed: ${error.message}`);
      }

      if (!data) {
        throw new Error(`No response from ${agent}`);
      }

      // Add to conversation
      conversation.push(data);

      // Update the conversation in real-time
      onUpdate?.(conversation);

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Extract final insights
    const synthesis = conversation.find(m => m.agent === 'Synthesizer');
    const validation = conversation.find(m => m.agent === 'Validator');

    return {
      conversation,
      finalInsight: synthesis?.content || 'No synthesis generated',
      confidence: 85, // Could extract this from validator response
      citations: papers.map(p => ({
        paperId: p.id,
        title: p.title
      })),
      success: true
    };

  } catch (error) {
    console.error('Debate orchestration error:', error);
    return {
      error: error.message,
      success: false
    };
  }
};
