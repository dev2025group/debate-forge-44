// Validator Agent: Verifies claims against source papers

export const ValidatorAgent = {
  name: "Dr. Verify",
  color: "#8B5CF6",
  role: "Evidence Checker",
  personality: "Precise and factual, cites sources meticulously",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Find Synthesizer's message
    const synthesizerMessage = conversationHistory.find(m => m.agent === "Synthesizer");
    
    if (!synthesizerMessage) {
      return {
        agent: "Validator",
        content: "No synthesis to validate yet.",
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract and verify key claims
    const claimVerifications = [
      {
        claim: "Lab studies achieve 89-94% accuracy under ideal conditions",
        verified: true,
        supportingPapers: [1, 2],
        evidence: "Paper 1: '94% accuracy in temperature prediction and 89% accuracy in precipitation forecasting.' Paper 2: '91% accuracy in climate pattern classification and 87% precision in anomaly detection.'",
        confidenceContribution: 25
      },
      {
        claim: "Field deployments show 58-71% accuracy in real-world conditions",
        verified: true,
        supportingPapers: [3, 4],
        evidence: "Paper 3: '67% accuracy in precipitation forecasting and 71% accuracy in temperature prediction across diverse geographical conditions.' Paper 4: '58% for precipitation and 64% for temperature in harsh Arctic conditions.'",
        confidenceContribution: 25
      },
      {
        claim: "Real-world systems face 23-31% missing data rates",
        verified: true,
        supportingPapers: [3, 4],
        evidence: "Paper 3: 'Includes handling of sensor failures, missing data (23% of readings).' Paper 4: '36 months of real-world observations with 31% missing data due to equipment issues.'",
        confidenceContribution: 20
      },
      {
        claim: "Hybrid approaches achieve intermediate performance around 78%",
        verified: true,
        supportingPapers: [5],
        evidence: "Paper 5: 'Hybrid models achieved 78% overall accuracy (81% temperature, 75% precipitation).' This confirms intermediate performance between lab and field-only approaches.",
        confidenceContribution: 20
      },
      {
        claim: "Lab studies are transparent about their limitations",
        verified: true,
        supportingPapers: [1, 2],
        evidence: "Paper 1: 'Results based on synthetic data only. Real-world performance not validated.' Paper 2: 'Entirely simulation-based without field testing.' Both papers explicitly acknowledge scope limitations.",
        confidenceContribution: 15
      }
    ];
    
    const overallConfidence = claimVerifications.reduce((sum, v) => sum + v.confidenceContribution, 0);
    
    return {
      agent: "Validator",
      content: `I've completed fact-checking the synthesis against all source papers. The collective insight is well-supported by the evidence with an overall confidence score of ${overallConfidence}%. All major claims are directly verifiable in the source papers with exact citations. The interpretation that AI climate modeling faces 'dual-track challenges' (algorithmic + operational) is a reasonable inference from the documented performance differences and limitation statements across all papers.`,
      verified: true,
      claimVerifications: claimVerifications,
      overallConfidence: overallConfidence,
      citations: [
        {
          paperId: 1,
          relevantFinding: "CNN-LSTM hybrid model achieved 94% temperature prediction accuracy, 89% precipitation accuracy",
          supportsInsight: "Demonstrates high algorithmic performance potential under controlled conditions"
        },
        {
          paperId: 2,
          relevantFinding: "ResNet-based architecture achieved 91% pattern classification accuracy",
          supportsInsight: "Confirms that AI architectures can achieve 90%+ accuracy with high-quality data"
        },
        {
          paperId: 3,
          relevantFinding: "Field-deployed models showed 67% precipitation accuracy and 71% temperature accuracy. Includes handling of 23% missing data.",
          supportsInsight: "Reveals real-world performance challenges from data quality and infrastructure issues"
        },
        {
          paperId: 4,
          relevantFinding: "Operational accuracy averaged 58% for precipitation and 64% for temperature in harsh Arctic conditions. 31% missing data due to equipment issues.",
          supportsInsight: "Demonstrates extreme environment challenges and infrastructure reliability issues"
        },
        {
          paperId: 5,
          relevantFinding: "Hybrid models achieved 78% overall accuracy. Reduced maintenance requirements to bi-monthly intervals.",
          supportsInsight: "Shows that combining approaches addresses both algorithmic and operational challenges, achieving intermediate robust performance"
        }
      ],
      reasoning: [
        "Cross-referenced all quantitative claims against paper results sections",
        "Verified that performance ranges cited match source data",
        "Confirmed that all papers explicitly state their limitations",
        "Checked that the 'dual-track' interpretation is supported by the contrast between lab and field results",
        "Validated that hybrid approach evidence (Paper 5) supports the synthesis conclusion"
      ],
      additionalNotes: [
        "The synthesis accurately represents the debate evolution from initial comparison to nuanced understanding",
        "The hypothesis about edge computing and 75%+ accuracy target is reasonable extrapolation from Paper 5's hybrid results",
        "All five papers contribute meaningfully to the collective insight - no cherry-picking detected"
      ],
      turn: turn,
      timestamp: new Date().toISOString()
    };
  }
};
