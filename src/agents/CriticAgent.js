// Critic Agent: Challenges claims and finds issues in analysis

export const CriticAgent = {
  name: "Dr. Skeptic",
  color: "#EF4444",
  role: "Critical Reviewer",
  personality: "Rigorous and skeptical, questions assumptions",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Find most recent Researcher message
    const lastResearcherMessage = conversationHistory.filter(m => m.agent === "Researcher").slice(-1)[0];
    
    if (!lastResearcherMessage) {
      return {
        agent: "Critic",
        content: "Waiting for initial analysis...",
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // First critique
    if (conversationHistory.filter(m => m.agent === "Critic").length === 0) {
      return {
        agent: "Critic",
        content: `I need to challenge several aspects of this analysis. While you've identified a performance gap, you're comparing fundamentally different research objectives. Papers 1 and 2 explicitly state they're establishing theoretical bounds using synthetic data - they're not claiming these results transfer to real deployments. Meanwhile, Papers 3 and 4 are tackling entirely different problems: Paper 3 deals with agricultural regions with 23% missing data, and Paper 4 operates in one of Earth's most extreme environments. Comparing their results directly is misleading.`,
        challenges: [
          "You're comparing apples to oranges: lab studies aim for theoretical benchmarks, field studies solve practical deployment problems",
          "Paper 4's Arctic deployment faces unique challenges (polar night, extreme cold, hardware failures) not representative of general climate modeling",
          "You didn't adequately emphasize that ALL papers acknowledge their limitations explicitly in their abstracts",
          "The 'performance gap' framing suggests lab results are promises being broken, when they're actually methodological baselines",
          "Paper 5's 78% accuracy in hybrid approach is actually impressive given it handles real-world data quality issues"
        ],
        counterEvidence: [
          "Paper 1 explicitly states: 'Real-world performance not validated' (limitations)",
          "Paper 3's 67% accuracy comes with 23% missing data - that's not a fair comparison to perfect lab data",
          "Paper 4 operates in conditions explicitly noted as 'unique challenges not applicable to temperate zones'",
          "Paper 5 demonstrates hybrid approach reduces maintenance to bi-monthly vs. monthly - that's a practical win"
        ],
        questions: [
          "What would be a fair baseline for comparing real-world performance given data quality issues?",
          "Shouldn't we focus on Paper 5's hybrid approach as the most practical path forward?",
          "How do we account for the different problem scopes when making cross-study comparisons?",
          "What accuracy would YOU expect for a system dealing with 23-31% missing data and monthly hardware failures?"
        ],
        reasoning: [
          "Lab studies are transparent about scope - they're not overselling",
          "Each study targets different deployment scenarios with different constraints",
          "Real-world accuracy drops are explained by documented systematic issues (missing data, sensor failures)",
          "The analysis unfairly penalizes practical research for tackling harder problems"
        ],
        requestsResponse: "Researcher",
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Second round (if needed) - lighter follow-up
    return {
      agent: "Critic",
      content: `Thank you for the revised analysis. I'm more satisfied with acknowledging the different research contexts. However, I still think we should be careful about the 'gap' framing. The real insight here isn't that field studies 'fail' to match lab results - it's that lab studies successfully isolate model architecture performance, while field studies reveal that data infrastructure and environmental robustness are equally important challenges. Paper 5's hybrid approach suggests both dimensions matter.`,
      challenges: [
        "The 15-30% 'accuracy penalty' language still implies lab results are the 'correct' baseline",
        "We should emphasize that field studies tackle additional challenges beyond pure model performance"
      ],
      counterEvidence: [
        "Paper 5's results show that addressing real-world challenges (not just improving models) is where progress happens"
      ],
      questions: [
        "Should our takeaway be about improving models, or about improving data infrastructure and robustness?"
      ],
      reasoning: [
        "Framing matters for how readers interpret these findings",
        "Both research directions are valid and complementary"
      ],
      requestsResponse: null,
      turn: turn,
      timestamp: new Date().toISOString()
    };
  }
};
