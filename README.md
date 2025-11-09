
# 🧠 Multi-Agent Research Debate System

> AI agents that collaborate, debate, and reason together to analyze research papers

**Hackathon Challenge (Hack-Nation.ai)**:Research Agent – Agentic AI for accelerated research
Track: VC big bets 


---

## 🎯 What It Does

This system simulates a research lab where multiple AI agents analyze scientific papers through structured debate. Instead of just summarizing, agents challenge each other's findings, connect patterns across papers, and verify claims against source material—producing transparent, evidence-based insights.

**Live Demo**: https://debate-forge-44.lovable.app/

---

## 🤖 Meet The Agents

- **🧠 Dr. Research (Researcher)** - Extracts key findings and summarizes papers  
- **🔴 Dr. Critical (Critic)** - Challenges assumptions, identifies flaws, and asks follow-up questions  
- **🟢 Dr. Synthesis (Synthesizer)** - Connects patterns and builds unified insights  
- **🟣 Dr. Verify (Validator)** - Cross-checks claims against source papers for accuracy

---

## ✨ Key Features

### 📄 Paper Input
- Upload PDFs of research papers
- Search arXiv database directly (optional)
- Use sample papers for quick demo

### 🎭 Multi-Agent Debate
- Agents debate in real-time until Critic approves
- Each claim is backed by evidence citations
- Dynamic debate length based on paper complexity

### 📊 Visual Debate Flow
- Interactive graph showing conversation flow
- Color-coded agent messages for easy tracking

### 📑 Export Results
- Generate PDF reports with insights
- Includes debate visualization
- Confidence scores for each finding

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Platform** | Lovable AI | Full-stack development & AI orchestration |
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS + shadcn-ui | Responsive design system |
| **AI** | Google Gemini 2.5 Flash | Powers all 4 agents |
| **Backend** | Lovable Cloud (Supabase) | Serverless edge functions |
| **PDF Processing** | pdfjs-dist | Extract text from papers |
| **Visualization** | React Flow | Interactive debate graphs |
| **Export** | jsPDF + html-to-image | PDF report generation |

---

## 🚀 How It Works

```

Upload Paper(s) → Auto-Parse Sections → Multi-Agent Debate
↓
Export PDF ← Display Insights ← Critic Validates

````

### Debate Process
1. Dr. Research analyzes papers and presents initial findings  
2. Dr. Critical challenges the analysis and asks for clarification  
3. Dr. Research refines findings based on feedback  
4. Dr. Synthesis merges outputs into collective insights  
5. Dr. Verify validates claims against original papers

---

## 💪 Challenges We Solved

1. **Inconsistent AI Responses**  
   - Problem: AI generates outputs in varying formats  
   - Solution: Pattern matching and structured data extraction

2. **Knowing When to Stop the Debate**  
   - Problem: Avoid endless back-and-forth  
   - Solution: Critic agent signals completion

3. **PDF Text Extraction**  
   - Problem: Complex PDF layouts  
   - Solution: `pdfjs-dist` with section parsing logic

4. **Real-Time Visualization**  
   - Problem: Making the debate process visible  
   - Solution: React Flow interactive graphs

---

## 🔮 Future Improvements

- Save debate history to database  
- Support longer papers with smart chunking  
- Add more specialized agents (Statistician, Ethicist)  
- Allow users to ask follow-up questions to agents  
- Enhance error handling for malformed PDFs

---

## 🏃 Quick Start

### Prerequisites
- Node.js 16+  
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/<USERNAME>/<REPO>.git

# Navigate to project
cd research-debate-system

# Install dependencies
npm install

# Start development server
npm run dev
````

Visit `http://localhost:8080` to see the app in action.

---

## 📦 Project Structure

```
src/
├── agents/
│   ├── ResearcherAgent.js
│   ├── CriticAgent.js
│   ├── SynthesizerAgent.js
│   └── ValidatorAgent.js
├── debate/
│   └── ConversationOrchestrator.js
├── components/
│   ├── DebateViewer.tsx
│   ├── DebateFlowGraph.tsx
│   ├── InsightReport.tsx
│   └── PdfUploader.tsx
└── pages/
    └── Index.tsx
supabase/functions/
└── agent-respond/
```

---

## 🏆 Built For

**Hackathon Challenge:** Multi-agent reasoning and collaboration
**Built in:** 24 hours
**Team Size:** [Solo]

---

## 📄 License

MIT License – Feel free to use and adapt

---

## 🙏 Acknowledgments

* Lovable AI for rapid full-stack development
* Google Gemini for AI intelligence
* Open-source community for libraries & tools

---

**Made with ❤️ using Lovable**
