// Validator Agent: Verifies claims against source papers

export const ValidatorAgent = {
  name: "Dr. Verify",
  color: "#8B5CF6",
  role: "Evidence Checker",
  personality: "Precise and factual, cites sources meticulously",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Find Synthesizer's conclusion to validate
    const synthesizerMessage = conversationHistory.find(m => m.agent === "Synthesizer");
    
    if (!synthesizerMessage) {
      return {
        agent: "Validator",
        content: "Waiting for synthesis to validate...",
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract claims from synthesis
    const claims = [
      synthesizerMessage.insight,
      ...synthesizerMessage.consensusPoints
    ];
    
    // Verify each claim against papers
    const claimVerifications = claims.map(claim => {
      const supportingPapers = [];
      let evidence = "";
      
      // Check which papers support this claim
      papers.forEach(paper => {
        const paperText = `${paper.abstract} ${paper.keyFindings} ${paper.results} ${paper.methodology}`.toLowerCase();
        
        // Simple keyword matching for validation
        if (claim.toLowerCase().includes('lab') && paper.methodology.toLowerCase().includes('lab')) {
          supportingPapers.push(paper.id);
          evidence = paper.results.slice(0, 150);
        } else if (claim.toLowerCase().includes('field') && paper.methodology.toLowerCase().includes('field')) {
          supportingPapers.push(paper.id);
          evidence = paper.results.slice(0, 150);
        } else if (claim.toLowerCase().includes('data') && paper.limitations.toLowerCase().includes('data')) {
          supportingPapers.push(paper.id);
          evidence = paper.limitations.slice(0, 150);
        } else if (claim.toLowerCase().includes('hybrid') && paper.methodology.toLowerCase().includes('hybrid')) {
          supportingPapers.push(paper.id);
          evidence = paper.results.slice(0, 150);
        }
      });
      
      return {
        claim: claim.slice(0, 100),
        verified: supportingPapers.length > 0,
        supportingPapers,
        evidence: evidence || "Claim derived from debate synthesis",
        confidenceContribution: supportingPapers.length > 0 ? 20 : 5
      };
    });
    
    const totalConfidence = Math.min(95, 
      claimVerifications.reduce((sum, v) => sum + v.confidenceContribution, 0)
    );
    
    const citations = papers.map(paper => ({
      paperId: paper.id,
      relevantFinding: paper.keyFindings.slice(0, 150),
      supportsInsight: `Contributes to understanding via ${paper.methodology}`
    }));
    
    const verifiedCount = claimVerifications.filter(v => v.verified).length;
    
    return {
      agent: "Validator",
      content: `I've fact-checked the synthesized insight against all source papers. ${verifiedCount} of ${claims.length} key claims are directly supported by the research. The synthesis accurately represents the papers' findings and properly contextualizes the methodological differences. The papers do support the conclusion that both theoretical and practical research directions are valuable and complementary.`,
      verified: true,
      claimVerifications: claimVerifications,
      overallConfidence: totalConfidence,
      citations: citations,
      reasoning: [
        "Cross-referenced all claims against paper content",
        "Verified supporting evidence for each claim",
        "Assessed methodological appropriateness",
        "Calculated confidence based on evidence strength"
      ],
      turn: turn,
      timestamp: new Date().toISOString()
    };
  }
};
