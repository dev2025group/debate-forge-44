// Researcher Agent: Analyzes papers and extracts patterns

export const ResearcherAgent = {
  name: "Dr. Research",
  color: "#3B82F6",
  role: "Pattern Analyzer",
  personality: "Thorough and optimistic, seeks insights across papers",
  
  respond: function(papers, conversationHistory) {
    const turn = conversationHistory.length + 1;
    
    // Analyze the actual papers provided
    const methodologies = {};
    const accuracyNumbers = [];
    
    papers.forEach(paper => {
      const method = paper.methodology.toLowerCase();
      if (method.includes('lab') || method.includes('simulation') || method.includes('synthetic')) {
        methodologies['laboratory'] = (methodologies['laboratory'] || 0) + 1;
      } else if (method.includes('field') || method.includes('real-world') || method.includes('deployment')) {
        methodologies['field'] = (methodologies['field'] || 0) + 1;
      } else if (method.includes('hybrid')) {
        methodologies['hybrid'] = (methodologies['hybrid'] || 0) + 1;
      } else {
        methodologies['other'] = (methodologies['other'] || 0) + 1;
      }
      
      // Extract percentage numbers from results
      const percentMatches = paper.results.match(/(\d+(?:\.\d+)?)\s*%/g);
      if (percentMatches) {
        percentMatches.forEach(match => {
          const num = parseFloat(match);
          if (num > 0 && num <= 100) accuracyNumbers.push(num);
        });
      }
    });
    
    // First analysis
    if (conversationHistory.length === 0) {
      const avgAccuracy = accuracyNumbers.length > 0 
        ? (accuracyNumbers.reduce((a, b) => a + b, 0) / accuracyNumbers.length).toFixed(1)
        : "N/A";
      
      const labPapers = papers.filter(p => 
        p.methodology.toLowerCase().includes('lab') || 
        p.methodology.toLowerCase().includes('simulation')
      );
      const fieldPapers = papers.filter(p => 
        p.methodology.toLowerCase().includes('field') || 
        p.methodology.toLowerCase().includes('deployment')
      );
      
      let analysisContent = `I've analyzed all ${papers.length} research papers. `;
      
      if (labPapers.length > 0 && fieldPapers.length > 0) {
        analysisContent += `I notice ${labPapers.length} laboratory/simulation studies and ${fieldPapers.length} field deployment studies. `;
        analysisContent += `Lab studies tend to report higher performance metrics, while field studies show more modest results, likely due to real-world constraints like data quality issues, sensor failures, and environmental factors. `;
      } else {
        analysisContent += `The papers use diverse methodologies: ${Object.entries(methodologies).map(([k, v]) => `${v} ${k}`).join(', ')}. `;
      }
      
      if (accuracyNumbers.length > 0) {
        const maxAcc = Math.max(...accuracyNumbers);
        const minAcc = Math.min(...accuracyNumbers);
        analysisContent += `Performance metrics range from ${minAcc.toFixed(1)}% to ${maxAcc.toFixed(1)}%, with an average of ${avgAccuracy}%. `;
      }
      
      // Find common themes in limitations
      const commonLimitations = papers.filter(p => 
        p.limitations.toLowerCase().includes('data') || 
        p.limitations.toLowerCase().includes('missing')
      );
      if (commonLimitations.length > 0) {
        analysisContent += `${commonLimitations.length} papers explicitly mention data quality or missing data as key limitations. `;
      }
      
      return {
        agent: "Researcher",
        content: analysisContent,
        analysis: {
          patternsFound: Object.entries(methodologies).map(([method, count]) => 
            `${count} paper(s) using ${method} methodology`
          ).concat(
            accuracyNumbers.length > 0 
              ? [`Performance metrics range: ${Math.min(...accuracyNumbers).toFixed(1)}%-${Math.max(...accuracyNumbers).toFixed(1)}%`]
              : []
          ),
          claimsExtracted: papers.slice(0, 3).map(p => 
            `${p.title}: ${p.keyFindings.slice(0, 100)}...`
          ),
          methodologyBreakdown: methodologies
        },
        reasoning: [
          "Analyzed all papers systematically across methodologies",
          "Extracted and compared quantitative metrics where available",
          "Identified common themes in limitations and challenges",
          "Noted relationships between methodology and reported outcomes"
        ],
        references: papers.map(p => p.id),
        turn: turn,
        timestamp: new Date().toISOString()
      };
    }
    
    // Response to Critic
    const lastCriticMessage = conversationHistory.filter(m => m.agent === "Critic").slice(-1)[0];
    
    if (lastCriticMessage) {
      return {
        agent: "Researcher",
        content: `You raise valid points about research context. I acknowledge that comparing different methodologies requires careful consideration of their respective objectives. Lab studies establish theoretical benchmarks, while field studies address practical deployment challenges. The performance differences likely reflect these different problem scopes rather than simple shortcomings. I'll revise my analysis to better account for these contextual factors and the explicit limitations stated in each paper.`,
        analysis: {
          revisedClaims: [
            "Different methodologies serve different research purposes",
            "Performance variations reflect problem scope differences",
            "Practical constraints (data quality, environmental factors) explain field study results",
            "Both theoretical and practical research contribute valuable insights"
          ]
        },
        reasoning: [
          "Reconsidered the fairness of direct comparisons",
          "Reviewed stated limitations in each paper",
          "Acknowledged different research objectives",
          "Maintained focus on systematic patterns while respecting context"
        ],
        references: papers.map(p => p.id),
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
