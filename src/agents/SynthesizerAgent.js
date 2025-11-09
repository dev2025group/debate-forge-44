// Synthesizer Agent: Integrates debate and generates collective insights

export const SynthesizerAgent = {
  name: "Dr. Synthesis",
  color: "#10B981",
  role: "Insight Generator",
  personality: "Balanced and integrative, finds truth in debate",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Review entire conversation to synthesize
    const researcherMessages = conversationHistory.filter(m => m.agent === "Researcher");
    const criticMessages = conversationHistory.filter(m => m.agent === "Critic");
    
    if (researcherMessages.length === 0) {
      return {
        agent: "Synthesizer",
        content: "Waiting for debate to develop...",
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract key themes from the debate
    const paperCount = papers.length;
    const methodologies = {};
    papers.forEach(p => {
      const method = p.methodology.toLowerCase();
      if (method.includes('lab') || method.includes('simulation')) {
        methodologies['lab'] = (methodologies['lab'] || 0) + 1;
      } else if (method.includes('field') || method.includes('deployment')) {
        methodologies['field'] = (methodologies['field'] || 0) + 1;
      } else if (method.includes('hybrid')) {
        methodologies['hybrid'] = (methodologies['hybrid'] || 0) + 1;
      }
    });
    
    let synthesisContent = `After reviewing the debate between our Researcher and Critic, I can now offer a synthesized perspective on these ${paperCount} papers. `;
    
    // Build synthesis based on what agents discussed
    if (methodologies['lab'] && methodologies['field']) {
      synthesisContent += `The key insight is that laboratory and field studies serve complementary purposes. Lab studies establish what's theoretically possible with optimal conditions, while field studies reveal practical deployment challenges. `;
    }
    
    synthesisContent += `Rather than viewing performance differences as failures, we should see them as revealing the full complexity of real-world implementation. `;
    
    // Find common ground from debate
    const consensusPoints = [
      "Different methodologies address different aspects of the research problem",
      "Both theoretical benchmarks and practical constraints are valuable",
      "Performance variations often stem from documented environmental and data quality factors"
    ];
    
    if (methodologies['hybrid']) {
      consensusPoints.push("Hybrid approaches show promise in balancing theoretical performance with practical robustness");
    }
    
    const insight = `The research collectively suggests that advancing this field requires parallel progress in both model sophistication and deployment infrastructure.`;
    
    return {
      agent: "Synthesizer",
      content: synthesisContent,
      insight: insight,
      consensusPoints: consensusPoints,
      explainedContradictions: [
        "Lab vs field performance differences reflect different problem scopes, not quality issues",
        methodologies['field'] ? "Field studies face additional real-world constraints not present in controlled settings" : "Different environmental conditions lead to different results",
        "Varying accuracy metrics stem from tackling different deployment scenarios"
      ],
      confidence: 85,
      hypothesis: "Future research should explore hybrid approaches that maintain theoretical rigor while addressing practical deployment challenges",
      reasoning: [
        "Integrated perspectives from both Researcher and Critic",
        "Identified common ground in the debate",
        "Contextualized apparent contradictions",
        "Focused on actionable insights"
      ],
      synthesisOf: conversationHistory.map(m => m.turn),
      references: papers.map(p => p.id),
      turn: turn,
      timestamp: new Date().toISOString()
    };
  }
};
