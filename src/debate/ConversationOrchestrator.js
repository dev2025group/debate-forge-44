// Conversation Orchestrator: Coordinates multi-turn debate between agents

import { ResearcherAgent } from '../agents/ResearcherAgent';
import { CriticAgent } from '../agents/CriticAgent';
import { SynthesizerAgent } from '../agents/SynthesizerAgent';
import { ValidatorAgent } from '../agents/ValidatorAgent';

export async function runDebate(papers, onUpdate = null) {
  const conversation = [];
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // TURN 1: Researcher analyzes papers
    console.log("Turn 1: Researcher analyzing papers...");
    const researcherMsg1 = ResearcherAgent.respond(papers, conversation);
    conversation.push(researcherMsg1);
    if (onUpdate) onUpdate([...conversation]);
    await delay(2000);
    
    // TURN 2: Critic challenges Researcher
    console.log("Turn 2: Critic reviewing analysis...");
    const criticMsg1 = CriticAgent.respond(papers, conversation);
    conversation.push(criticMsg1);
    if (onUpdate) onUpdate([...conversation]);
    await delay(2000);
    
    // TURN 3: Researcher responds to critique
    console.log("Turn 3: Researcher addressing critique...");
    const researcherMsg2 = ResearcherAgent.respond(papers, conversation);
    conversation.push(researcherMsg2);
    if (onUpdate) onUpdate([...conversation]);
    await delay(2000);
    
    // TURN 4: Additional debate round
    console.log("Turn 4: Critic's final thoughts...");
    const criticMsg2 = CriticAgent.respond(papers, conversation);
    conversation.push(criticMsg2);
    if (onUpdate) onUpdate([...conversation]);
    await delay(2000);
    
    // TURN 5: Synthesizer creates insight
    console.log("Turn 5: Synthesizer generating collective insight...");
    const synthesizerMsg = SynthesizerAgent.respond(papers, conversation);
    conversation.push(synthesizerMsg);
    if (onUpdate) onUpdate([...conversation]);
    await delay(2000);
    
    // TURN 6: Validator verifies
    console.log("Turn 6: Validator fact-checking...");
    const validatorMsg = ValidatorAgent.respond(papers, conversation);
    conversation.push(validatorMsg);
    if (onUpdate) onUpdate([...conversation]);
    
    console.log("Debate complete!");
    return {
      conversation,
      finalInsight: synthesizerMsg.insight,
      confidence: validatorMsg.overallConfidence,
      citations: validatorMsg.citations,
      success: true
    };
    
  } catch (error) {
    console.error("Debate error:", error);
    return {
      conversation,
      error: error.message,
      success: false
    };
  }
}

export function getAgentByName(name) {
  const agents = {
    "Researcher": ResearcherAgent,
    "Critic": CriticAgent,
    "Synthesizer": SynthesizerAgent,
    "Validator": ValidatorAgent
  };
  return agents[name];
}

export const agentsList = [
  ResearcherAgent,
  CriticAgent,
  SynthesizerAgent,
  ValidatorAgent
];
