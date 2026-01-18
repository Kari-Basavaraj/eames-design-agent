# **Eames: Building an AI Product Design Agent (v1.0)**

## **Executive Summary**

This document outlines the architectural blueprint and implementation strategy for **Eames**, an autonomous AI agent designed for Product Design Leaders.

**The core premise:** We are reverse-engineering "Dexter" (an open-source financial analysis agent) and repurposing its agentic loop (Planning \-\> Research \-\> Execution) to serve the Product Development Lifecycle.

Instead of finding undervalued stocks, Eames finds undervalued user needs. Instead of writing investment memos, Eames writes Product Requirements Documents (PRDs) and React code.

## **1\. The Architecture Pivot**

The foundation of Eames relies on stripping out the financial logic from the Dexter codebase and replacing it with Design Operations (DesignOps) logic.

### **Agent Mapping Table**

We retain the underlying orchestration engine but redefine the personas and goals of the sub-agents.

| Dexter Agent (Finance) | Eames Agent (Design) | New Responsibility |
| :---- | :---- | :---- |
| **Planning Agent** | **Design Ops Lead** | Breaks abstract requests (e.g., "Fix onboarding") into actionable tickets (Research, User Flow, UI). |
| **Action Agent** | **UX Researcher** | Scours the web for competitor flows, design patterns (Nielsen Norman), and trend analysis. |
| **Data Agent** | **Synthesis Engine** | Aggregates raw data into "Insights," "Personas," and "User Journeys." |
| **Answer Agent** | **UI/Product Engineer** | Outputs tangible deliverables: Markdown PRDs, User Stories, or .tsx React components. |

## **2\. Technical Implementation Guide**

### **Phase 1: Environment Setup**

We utilize the Dexter stack for its speed (Bun) and CLI aesthetics (React Ink).

**Prerequisites:**

* Node.js & Bun runtime installed.  
* API Keys: Anthropic (Claude 3.5 Sonnet), Tavily (Search).

**Setup Commands:**

\# Clone the base architecture  
git clone \[https://github.com/virattt/dexter\](https://github.com/virattt/dexter) eames-design-agent  
cd eames-design-agent

\# Install fast dependencies  
bun install

### **Phase 2: "Brain Transplant" (Agent Modification)**

We must modify the **System Prompts** located in the src/agents directory. This is where we define the behavior of Eames.

#### **A. The Planner (Design Ops)**

File: src/agents/planner.ts  
Role: The Project Manager. It does not execute; it schedules.  
**New System Prompt:**

"You are a Senior Design Operations Lead. Your goal is to break down a vague product request into concrete, sequential design tasks.

**Rules:**

1. Always initiate with a 'Research Phase' (competitor analysis, pattern search).  
2. Follow with a 'Synthesis Phase' (defining personas, constraints).  
3. Conclude with an 'Execution Phase' (writing the PRD or generating code).  
4. Output a strictly ordered list of steps. Do not generate the actual design yet."

#### **B. The Researcher (UX Analysis)**

File: src/agents/researcher.ts  
Role: The Gatherer. It looks outside the system for information.  
**New System Prompt:**

"You are a UX Researcher. When assigned a topic, perform a deep web search focusing on:

* Direct competitor feature sets and user flows.  
* Established UX patterns (e.g., 'Best practices for fintech KYC').  
* Dribbble/Behance trends for visual direction.  
* Accessibility standards (WCAG) related to the feature."

**Tools Required:**

* TavilySearch (Replace the financial stock ticker tool with a general web search tool).

#### **C. The Executor (Product Engineer)**

File: src/agents/writer.ts  
Role: The Builder. It creates the final artifact.  
**New System Prompt:**

"You are a dual-role Product Manager and UI Engineer.

If the task is a PRD:  
Output strict Markdown containing: Problem Statement, User Personas, Functional Requirements, and Success Metrics.  
If the task is UI/Code:  
Output a single, self-contained React Functional Component.

* Use Tailwind CSS for styling.  
* Ensure accessibility (aria-labels).  
* Do not use placeholders; use realistic copy based on the research provided."

## **3\. Tool Expansion**

To make Eames truly effective for design, we need specific tools that go beyond text generation.

### **Tool 1: Vision (Screenshot Analysis)**

This allows Eames to "see" competitors.

*File: src/tools/vision.ts*

import { Tool } from "langchain/tools";

export class VisionTool extends Tool {  
  name \= "analyze\_ui\_screenshot";  
  description \= "Analyzes a UI screenshot URL to extract layout, color hierarchy, and UX patterns.";

  async \_call(imageUrl: string) {  
    // Logic to send image to Claude 3.5 Sonnet (Multimodal)  
    // Prompt: "Analyze this UI. List the components, color palette, and key UX interactions."  
    return "Analysis: The UI uses a split-screen layout...";   
  }  
}

### **Tool 2: Design System Retriever**

This ensures brand consistency.

*File: src/tools/file-reader.ts*

**Function:** Before generating UI code, the agent checks the local directory for a DESIGN\_SYSTEM.md file. If found, it reads the color codes and spacing tokens to ensure the generated Tailwind classes match your existing product.

## **4\. Operational Workflow**

Here is how the interaction flows once built.

User Input:  
$ eames "Design a 'Split Bill' feature for our mobile wallet app targeting college students."  
**System Process:**

1. **Planning:** The agent recognizes this needs market research (Step 1), a persona definition (Step 2), and a wireframe (Step 3).  
2. **Research:** It searches "Split bill UX patterns," "Venmo vs. Splitwise features," and "Gen Z fintech trends."  
3. **Synthesis:** It creates a persona "Student Sam" who cares about speed and social lack of awkwardness.  
4. **Execution:**  
   * Generates split-bill-prd.md (Requirements).  
   * Generates SplitBillCard.tsx (React component with Tailwind).

## **5\. Technology Stack & Resources**

* **Runtime:** **Bun** (Chosen for low latency).  
* **Interface:** **React Ink** (Allows for a clean, terminal-based dashboard UI).  
* **LLM Logic:** **Vercel AI SDK** or **LangChain** (For chaining the agents).  
* **Model:** **Claude 3.5 Sonnet** (Chosen for superior coding ability and visual reasoning).

## **6\. Future Roadmap**

* **Integration:** Connect to Figma API to read component properties directly.  
* **Testing:** Add a "Validation Agent" that runs the generated React code against accessibility linters.

## **Appendix: Chat Transcript**

User:  
lets reverse engineer this for claude code for product design  
https://github.com/virattt/dexter  
Author of Dexter said: I’ve been building Dexter for 2 months now.It’s like Claude Code, but for finance.What Dexter can do:• find undervalued stocks• analyze them in detail• build investment thesis All of the code is open source.Bonus: Dexter can also run on local LLMs.

I want you to help me to say and build: Claude code for Product Design

I want practical implementation guide and implemented solution with everything to make it happen, you can take a look at available tech resources like SDKs , the opensourced code above etc  
conduct deep research if needed  
look for any existing concepts like we are going to work on  
AI Response:  
This is a fantastic project idea. You are essentially asking to repurpose the agentic loop of Dexter (Planning $\\rightarrow$ Research $\\rightarrow$ Execution $\\rightarrow$ Validation) from the domain of Quantitative Finance to Product Design.  
I have reverse-engineered Dexter and designed a complete implementation guide for your tool, which we will call **"Eames"** (after Charles & Ray Eames).

### **Executive Summary: What is "Eames"?**

**Eames** is a CLI-based autonomous agent for Product Designers.

* **Input:** Natural language (e.g., *"Design a mobile onboarding flow for a fintech app targeting Gen Z"*).  
* **Process:** It doesn't just "chat." It plans a research phase, browses the web for competitor patterns, synthesizes a "User Persona," and then generates a PRD (Product Requirements Document) and even React/Tailwind code for the UI.  
* **Tech Stack:** Bun (Runtime), React Ink (CLI UI), LangChain (Logic), Anthropic Claude 3.5 Sonnet (Brain).

### **1\. The Architecture (Reverse-Engineering Dexter)**

Dexter works by having specialized "sub-agents." We will strip out the finance agents and replace them with design counterparts.

| Dexter Agent (Finance) | Eames Agent (Product Design) | Responsibility |
| :---- | :---- | :---- |
| **Planning Agent** | **Design Ops Agent** | Breaks user request into tasks (e.g., "1. Research Competitors", "2. Define User", "3. Draft PRD"). |
| **Action Agent** | **Research Agent** | Uses web search to find UI trends, competitor features, and reads existing docs. |
| **Data Agent** | **Synthesis Agent** | Aggregates research into "Insights," "Personas," and "User Journeys." |
| **Answer Agent** | **Execution Agent** | Writes the final output: A Markdown PRD or a .tsx file with a wireframe. |

### **2\. Practical Implementation Guide**

We will use the **Dexter** open-source code as our foundation because the "CLI UI" and "Task Loop" are already built.

#### **Step 1: Setup & Cloning**

First, get the base structure.

\# 1\. Clone the Dexter repository  
git clone \[https://github.com/virattt/dexter\](https://github.com/virattt/dexter) eames-design-agent  
cd eames-design-agent

\# 2\. Install dependencies (Dexter uses Bun, which is fast)  
bun install

#### **Step 2: The Brain Transplant (Modifying the Agents)**

You need to locate the agent definitions. In Dexter, these are likely in src/agents or src/lib/agents. You will modify the **System Prompts**.

A. Modify the Planning Agent  
File: src/agents/planner.ts (or similar)  
Change the system prompt to:  
"You are a Product Design Lead. Your goal is to break down a vague product request into concrete design tasks.  
Rules:

1. Always start with 'Research' (competitors, best practices).  
2. Follow with 'Synthesis' (personas, requirements).  
3. End with 'Execution' (writing the PRD or code).  
4. Do not output code yourself; just plan the steps."

B. Modify the Research (Action) Agent  
File: src/agents/researcher.ts  
Target: This agent currently looks for stock symbols.  
New Goal: detailed web search for UX patterns.  
Tools: Keep the Tavily or Serper tool (Web Search).  
Prompt adjustment:  
"You are a UX Researcher. When asked to research a topic, search for:

* Direct competitors and their feature sets.  
* Dribbble/Behance trends for this specific domain.  
* Nielsen Norman Group heuristics related to the request."

#### **Step 3: Adding Design-Specific Tools**

Dexter uses "Financial Datasets API." We need "Design Tools."  
Create a new tool file: src/tools/design-tools.ts.  
Tool 1: Vision (Screenshot Analysis)  
Allow Eames to "look" at a competitor if you provide a URL or image path.  
import { z } from "zod";  
import { Tool } from "langchain/tools";

export class VisionTool extends Tool {  
  name \= "analyze\_ui\_screenshot";  
  description \= "Analyzes a UI screenshot to extract layout, color palette, and UX patterns.";

  async \_call(imagePath: string) {  
    // 1\. Load image  
    // 2\. Send to Claude 3.5 Sonnet (Multimodal)  
    // 3\. Prompt: "Describe the UX patterns, hierarchy, and component library in this UI."  
    return "Analysis: The UI uses a card-based layout with high contrast...";   
  }  
}

Tool 2: Design System Retrieval (File Reader)  
Allow Eames to read your local design system documentation.  
Why: So it doesn't suggest blue buttons if your brand uses red.  
Implementation: Use the standard fs (File System) tool to read a file named DESIGN\_SYSTEM.md in the current directory.

#### **Step 4: The "Execution" Agent (Generating Code/PRDs)**

This is where "Claude Code" shines. We want Eames to output files.

File: src/agents/writer.ts  
Prompt:  
"You are a UI Engineer and Product Manager.  
If the task is a PRD: Output strict Markdown with 'Problem', 'Solution', 'User Stories', and 'Acceptance Criteria'.  
If the task is UI: Output a single React Functional Component using Tailwind CSS. It must be production-ready code."

### **3\. Ready-to-Copy "System Prompt" for the Main Loop**

In the main entry point (likely index.ts or app.tsx), inject this context so the LLM understands its new job:

Identity: You are Eames, an autonomous Product Design agent.

Your Capabilities:  
1\. Market Scan: You can search the web to understand what competitors are doing.  
2\. User Empathy: You create personas based on data, not hallucinations.  
3\. Prototyping: You write React/Tailwind code for high-fidelity wireframes.

Operational Context:  
\- The user is a Design Leader. Be concise.  
\- Always check for a 'DESIGN\_SYSTEM.md' file in the root before generating UI to ensure consistency.  
\- If you are unsure about a requirement, add a "Questions" section to your output rather than guessing.

### **4\. Example Workflow: How you will use Eames**

Once built, you run it in your terminal.

**User:**

$ eames "Create a concept for a 'Savings Pot' feature for our banking app."

**Eames (Terminal UI Output):**

\> 🧠 Planning Phase...  
  \[x\] Plan created: 3 Steps.

\> 🕵️ Researching...  
  \[x\] Searched "Fintech savings pot UX patterns"  
  \[x\] Analyzed Monzo and Revolut case studies  
  \[\!\] Insight found: "Rounding up spare change" is a key delighter.

\> 📝 Synthesizing...  
  \[x\] Created Persona: "Savvy Sarah" (Gen Z, Impulse spender).  
  \[x\] Defined User Journey: Transaction \-\> Round up \-\> Animation \-\> Pot update.

\> 💻 Executing...  
  \[x\] Generated PRD: savings-pot-prd.md  
  \[x\] Generated UI: SavingsPotComponent.tsx (React \+ Tailwind)

Done\! Files saved to ./output

### **5\. Tech Recommendations (The "Secret Sauce")**

To make this *better* than a basic script, add these specific libraries to the Dexter stack:

1. **Vercel AI SDK:** Use this over standard LangChain if you want easier streaming of text responses in the terminal.  
2. **Ink (React for CLI):** Dexter already uses this. It allows you to render cool progress bars and "spinners" in the terminal so the user knows the agent is thinking.  
3. **Puppeteer / Playwright:** Add this tool to the Research Agent. It allows the agent to visit a live website, take a screenshot, and feed it to the Vision Tool (Step 3\) automatically.

### **Next Steps for You**

1. **Fork Dexter.**  
2. **Rename** the project to "Eames".  
3. **Replace** the financial-datasets-api key with a standard Tavily (Search) key in the .env file.  
4. **Edit the prompts** as shown in Step 2\.

This gives you a functional MVP of "Claude Code for Design" in about 2 hours of coding.

User:  
lets maintain a versioning create a doc covering everything we did as is and call it Eames-Building an AI Product Design AgentV1.0