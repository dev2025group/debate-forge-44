// Critic Agent: Challenges claims and finds issues in analysis

export const CriticAgent = {
  name: "Dr. Skeptic",
  color: "#EF4444",
  role: "Critical Reviewer",
  personality: "Rigorous and skeptical, questions assumptions",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Analyze papers for potential issues
    const paperTitles = papers.map(p => p.title);
    const hasComparisons = papers.length > 1;
    
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
      let critiqueContent = "I need to challenge several aspects of this analysis. ";
      
      if (hasComparisons) {
        critiqueContent += "When comparing papers with different methodologies, we must be careful not to compare apples to oranges. ";
        
        const labPapers = papers.filter(p => 
          p.methodology.toLowerCase().includes('lab') || 
          p.methodology.toLowerCase().includes('simulation')
        );
        const fieldPapers = papers.filter(p => 
          p.methodology.toLowerCase().includes('field') || 
          p.methodology.toLowerCase().includes('deployment')
        );
        
        if (labPapers.length > 0 && fieldPapers.length > 0) {
          critiqueContent += `Laboratory studies and field deployments have fundamentally different objectives - lab studies establish theoretical bounds, while field studies tackle practical deployment challenges. `;
        }
      }
      
      critiqueContent += "We should examine whether the analysis adequately accounts for the stated limitations in each paper. ";
      
      const papersWithLimitations = papers.filter(p => 
        p.limitations && p.limitations.length > 50
      );
      if (papersWithLimitations.length > 0) {
        critiqueContent += `${papersWithLimitations.length} papers explicitly discuss limitations that may affect interpretation of results. `;
      }
      
      return {
        agent: "Critic",
        content: critiqueContent,
        challenges: [
          hasComparisons ? "Direct comparisons may not account for fundamental differences in research objectives and constraints" : "The analysis should consider the scope and context of each study",
          "Different methodologies target different aspects of the problem - model performance vs. practical deployment",
          papers.some(p => p.limitations.toLowerCase().includes('data')) ? "Data quality issues mentioned in limitations affect result interpretation" : "Environmental and operational constraints may explain performance variations",
          "The framing of results should distinguish between theoretical capabilities and practical outcomes"
        ],
        counterEvidence: papers.slice(0, 2).map(p => 
          `${p.title}: "${p.limitations.slice(0, 100)}..."`
        ),
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
