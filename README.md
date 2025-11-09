
```markdown
# 🧠 Multi-Agent Research Debate System

> AI agents that collaborate, debate, and reason together to analyze research papers

**Hackathon Challenge**: Can AI agents reason and collaborate to uncover something new?

## 🎯 What It Does

This system simulates a research lab where four specialized AI agents analyze scientific papers through structured debate. Instead of just summarizing, they challenge each other's findings, connect patterns across papers, and verify claims against source material—producing transparent, evidence-based insights.

**Live Demo**: [Your deployed URL]

## 🤖 Meet The Agents

- **🧠 Dr. Research (Researcher)** - Extracts key findings and summarizes papers
- **🔴 Dr. Critical (Critic)** - Challenges assumptions, identifies flaws, determines when analysis is complete
- **🟢 Dr. Synthesis (Synthesizer)** - Connects patterns and builds unified insights
- **🟣 Dr. Verify (Validator)** - Cross-checks claims against source papers

## ✨ Key Features

### 📄 Paper Input (3 Ways)
- Upload your own PDFs
- Search arXiv database directly
- Try with sample papers

### 🎭 Multi-Agent Debate
- Agents debate in real-time until the Critic is satisfied
- Each claim is backed by evidence citations
- Dynamic debate length based on paper complexity

### 📊 Visual Debate Flow
- Interactive graph showing conversation flow
- Color-coded agent messages
- Track reasoning patterns

### 📑 Export Results
- Generate PDF reports with insights
- Includes debate visualization
- Confidence scores for each finding

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Platform** | Lovable AI | Full-stack development and AI orchestration |
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS + shadcn-ui | Responsive design system |
| **AI** | Google Gemini 2.5 Flash | Powers all 4 agents |
| **Backend** | Lovable Cloud (Supabase) | Serverless edge functions |
| **PDF Processing** | pdfjs-dist | Extract text from papers |
| **Visualization** | React Flow | Interactive debate graphs |
| **Export** | jsPDF + html-to-image | PDF report generation |

## 🚀 How It Works

```
1. Upload Paper(s) → 2. Auto-Parse Sections → 3. Multi-Agent Debate
                                                        ↓
                      6. Export PDF ← 5. Display Insights ← 4. Critic Validates
```

### The Debate Process

1. **Dr. Research** analyzes the paper and presents initial findings
2. **Dr. Critical** challenges the analysis, asks for deeper investigation
3. **Dr. Research** refines based on feedback (iterates until Critic approves)
4. **Dr. Synthesis** connects patterns and builds collective insights
5. **Dr. Verify** validates claims against source material

## 💪 Challenges We Solved

### 1. **Inconsistent AI Responses**
**Problem**: AI generated sections in different formats (bolding, capitalization, missing labels)

**Solution**: Implemented flexible pattern-matching using regular expressions to extract structured data regardless of formatting variations
```javascript
// Looks for multiple variations: **Abstract:**, Abstract:, ABSTRACT:, etc.
const abstractMatch = text.match(/\*\*Abstract:\*\*|\bAbstract:|\bABSTRACT:/i);
```

### 2. **Knowing When to Stop the Debate**
**Problem**: How many back-and-forth rounds are enough?

**Solution**: Gave the Critic agent special authority to signal completion by using phrases like "This analysis is now comprehensive" in its response

### 3. **PDF Text Extraction**
**Problem**: PDFs have complex layouts that don't extract cleanly

**Solution**: Used `pdfjs-dist` library with section parsing logic to identify Introduction, Methodology, Results, and Discussion sections

### 4. **Real-Time Visualization**
**Problem**: Making the invisible debate process visible

**Solution**: React Flow library to create interactive node-based graphs showing agent messages and conversation flow

## 🎓 What We Learned

- Getting AI agents to behave **consistently** is harder than making them smart
- Pattern-matching is essential when working with dynamic AI responses
- Clear agent roles and stopping conditions prevent endless debates
- Streaming responses create better user experience than waiting for full completion

## 🔮 Future Improvements

- [ ] Save debate history to database
- [ ] Support longer papers with smart chunking
- [ ] Add more specialized agents (e.g., Statistician, Ethicist)
- [ ] Better error handling for malformed PDFs
- [ ] Allow users to ask follow-up questions to agents

## 🏃 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone 

# Navigate to project
cd research-debate-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the app in action!

## 📦 Project Structure

```
src/
├── agents/               # Agent personality definitions
│   ├── ResearcherAgent.js
│   ├── CriticAgent.js
│   ├── SynthesizerAgent.js
│   └── ValidatorAgent.js
├── debate/
│   └── ConversationOrchestrator.js  # Debate flow logic
├── components/
│   ├── DebateViewer.tsx             # Real-time debate display
│   ├── DebateFlowGraph.tsx          # Visual graph
│   ├── InsightReport.tsx            # Final results
│   └── PdfUploader.tsx              # Paper input
└── pages/
    └── Index.tsx                    # Main app page

supabase/functions/
└── agent-respond/        # Edge function for AI processing
```

## 🏆 Built For

**AI Hackathon Challenge**: Multi-agent reasoning and collaboration

**Built in**: 48 hours

**Team Size**: [Solo / Team of X]

## 📄 License

MIT License - Feel free to use and adapt!

## 🙏 Acknowledgments

- Lovable AI for rapid full-stack development
- Google Gemini for powering agent intelligence
- The open-source community for amazing libraries

---

**Made with ❤️ using Lovable**
```

---
