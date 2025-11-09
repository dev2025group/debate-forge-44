// Researcher Agent: Analyzes papers and extracts patterns

export const ResearcherAgent = {
  name: "Dr. Research",
  color: "#3B82F6",
  role: "Pattern Analyzer",
  personality: "Thorough and optimistic, seeks insights across papers",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // First turn: Initial analysis
    if (conversationHistory.length === 0) {
      // Analyze methodology types
      const methodologies = {};
      papers.forEach(paper => {
        const type = paper.methodology.includes("laboratory") || paper.methodology.includes("simulation") ? "Lab/Simulation" :
                     paper.methodology.includes("field") || paper.methodology.includes("deployment") ? "Real-World" :
                     "Hybrid";
        methodologies[type] = (methodologies[type] || 0) + 1;
      });
      
      // Extract accuracy ranges
      const accuracies = papers.map(p => {
        const match = p.results.match(/(\d+)%/g);
        return match ? match.map(m => parseInt(m)) : [];
      }).flat();
      
      const avgLabAccuracy = papers
        .filter(p => p.methodology.includes("laboratory") || p.methodology.includes("simulation"))
        .map(p => p.results.match(/(\d+)%/g))
        .flat()
        .map(m => parseInt(m))
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      const avgRealWorldAccuracy = papers
        .filter(p => p.methodology.includes("field") || p.methodology.includes("deployment"))
        .map(p => p.results.match(/(\d+)%/g))
        .flat()
        .map(m => parseInt(m))
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      return {
        agent: "Researcher",
        content: `I've analyzed all ${papers.length} papers on AI for climate modeling. I've identified a striking pattern: there's a significant performance gap between laboratory studies and real-world deployments. Lab studies (Papers 1 & 2) consistently report 89-94% accuracy, while field deployments (Papers 3 & 4) show much lower performance at 58-71% accuracy. This suggests the technology works well in controlled conditions but faces substantial challenges in practice.`,
        analysis: {
          patternsFound: [
            "Lab studies show 89-94% accuracy vs. 58-71% in real-world deployments",
            "Simulation-based studies don't account for missing data, sensor failures, or extreme conditions",
            "Real-world studies cite 23-31% missing data rates as major challenge",
            "Hybrid approaches (Paper 5) achieve intermediate performance at 78%",
            "Cost increases dramatically for real deployments ($28K-$45K per station)"
          ],
          claimsExtracted: [
            "Lab models achieve 94% temperature prediction accuracy (Paper 1)",
            "Field deployments show 67% precipitation accuracy in practice (Paper 3)",
            "Arctic conditions reduce performance by additional 15-20% (Paper 4)",
            "Hybrid models balance accuracy and robustness at 78% (Paper 5)"
          ],
          methodologyBreakdown: methodologies,
          accuracyRanges: {
            lab: "89-94%",
            realWorld: "58-71%",
            hybrid: "78%"
          }
        },
        reasoning: [
          "Grouped papers by methodology type to identify systematic differences",
          "Extracted all quantitative performance metrics from results sections",
          "Compared controlled vs. uncontrolled environment performance",
          "Noted that lab studies explicitly acknowledge lack of real-world validation",
          "Identified cost and maintenance as practical barriers to deployment"
        ],
        references: [1, 2, 3, 4, 5],
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Response to Critic's challenge
    const lastCriticMessage = conversationHistory.filter(m => m.agent === "Critic").slice(-1)[0];
    
    if (lastCriticMessage) {
      return {
        agent: "Researcher",
        content: `You raise excellent points about the context of these studies. I acknowledge that my initial comparison may have been too simplistic. The lab studies explicitly state they're establishing theoretical performance bounds, not making claims about real-world applicability. However, I still maintain that the gap is significant and worth highlighting - even Paper 5's hybrid approach, which attempts to bridge this divide, achieves 78% accuracy, suggesting there are fundamental challenges in translating controlled performance to operational systems. The limitations sections across all papers consistently cite data quality, missing observations, and extreme conditions as persistent issues.`,
        analysis: {
          revisedClaims: [
            "Lab studies serve as theoretical benchmarks, not deployment predictions",
            "Real-world performance gap (15-30% lower) stems from systematic factors: missing data, sensor failures, extreme conditions",
            "Even optimized hybrid approaches face a 10-15% accuracy penalty in practice",
            "Cost-performance tradeoffs make high-accuracy deployments economically challenging"
          ],
          acknowledgedLimitations: [
            "Lab studies are transparent about their synthetic data limitations",
            "Different papers target different use cases and environmental conditions",
            "Arctic study (Paper 4) deals with uniquely challenging conditions"
          ]
        },
        reasoning: [
          "Reviewed limitations sections of lab studies - they're explicit about scope",
          "Re-examined Papers 3 and 5 for practical success factors",
          "Acknowledged that comparing Arctic conditions to general deployment is unfair",
          "Still maintain that the 15-30% accuracy gap across all non-lab studies indicates systematic challenges"
        ],
        references: [1, 2, 3, 5],
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      agent: "Researcher",
      content: "Continuing analysis...",
      turn: turn,
      timestamp: new Date().toISOString()
    };
  }
};
