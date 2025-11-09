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
    const MAX_DEBATE_ROUNDS = 8; // Maximum total turns to prevent infinite loops
    
    // Helper to call an agent
    const callAgent = async (agentType) => {
      const { data, error } = await supabase.functions.invoke('agent-respond', {
        body: {
          agentType,
          papers: papers,
          conversationHistory: conversation
        }
      });

      if (error) {
        console.error(`Error from ${agentType}:`, error);
        throw new Error(`${agentType} failed: ${error.message}`);
      }

      if (!data) {
        throw new Error(`No response from ${agentType}`);
      }

      conversation.push(data);
      onUpdate?.(conversation);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return data;
    };

    // Helper to check if Critic is satisfied
    const isCriticSatisfied = (criticResponse) => {
      const decision = criticResponse.sections?.["Decision"];
      if (!decision) return false; // If no decision section, assume needs more rounds
      
      // Check for SATISFIED status in the decision
      return decision.includes("SATISFIED") && !decision.includes("NEEDS_MORE_ROUNDS");
    };

    // Phase 1: Dynamic Researcher ↔ Critic debate
    console.log('Starting dynamic debate phase...');
    
    // Initial Researcher analysis
    await callAgent('Researcher');
    
    // Critic-driven iterative debate
    let debateRounds = 0;
    let criticSatisfied = false;
    
    while (!criticSatisfied && conversation.length < MAX_DEBATE_ROUNDS - 2) {
      debateRounds++;
      console.log(`Debate round ${debateRounds}`);
      
      // Critic responds
      const criticResponse = await callAgent('Critic');
      
      // Check if Critic is satisfied
      criticSatisfied = isCriticSatisfied(criticResponse);
      
      if (criticSatisfied) {
        console.log('Critic satisfied, moving to synthesis phase');
        break;
      }
      
      // If not satisfied and we haven't hit max rounds, Researcher responds
      if (conversation.length < MAX_DEBATE_ROUNDS - 2) {
        console.log('Critic needs more rounds, Researcher responding...');
        await callAgent('Researcher');
      }
    }
    
    // Phase 2: Synthesis and Validation
    console.log('Starting synthesis phase...');
    await callAgent('Synthesizer');
    await callAgent('Validator');

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
