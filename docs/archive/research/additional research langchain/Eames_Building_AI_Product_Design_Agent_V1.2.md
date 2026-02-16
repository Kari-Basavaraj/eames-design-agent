# **Eames V1.2: The Autonomous Design Firm Architecture**

Version: 1.2 (Master)  
Status: Architecture Definition  
Previous Version: V1.1 (Twin-Engine Visual Architect)

## **1\. Executive Summary: "The Design Firm in a Box"**

Eames V1.2 is not just a coding agent; it is an autonomous product design organization.  
It replaces the single "Creator/Director" loop with a Multi-LLM Council and introduces a Clarification Layer that questions user intent before writing a single line of code.  
**The Moat:** Eames is the only agent that *refuses* to build low-quality product features without first challenging the premise, just like a world-class Product Director.

## **2\. The LLM Council (The Brain)**

We assign specific roles to the models best suited for them. This minimizes hallucination and maximizes quality.

| Role | Persona | Model (Ideal) | Responsibility |
| :---- | :---- | :---- | :---- |
| **The Chair** (Orchestrator) | **Product VP** | **Claude 3.5 Sonnet** | Manages the conversation, decides which specialist to call, maintains the "Eames" identity. |
| **The Strategist** | **Product Director** | **OpenAI o1 / o3** | Deep reasoning. Reviews PRDs for business viability, metrics, and logical fallacies. |
| **The Visionary** | **Creative Director** | **Claude 3 Opus** | Brand alignment, empathy, copy voice, "Vibe Check." |
| **The Architect** | **Staff Engineer** | **Claude 3.5 Sonnet** | Writes the React/A2UI code. High technical accuracy. |
| **The Analyst** | **Researcher** | **Perplexity / Tavily** | Browses the live web for competitor data and market trends. |
| **The Critic** | **QA / User** | **Gemini 1.5 Pro** | Simulates the end-user. Reviews screenshots (Vision) and PRDs with a massive context window of history. |

## **3\. The "Clarification Loop" (The Moat)**

Before entering the "Ralph Loop" (Execution), Eames enters the **Intent Phase**.

**Workflow:**

1. **User:** "Build a crypto wallet."  
2. **Eames (Chair):** *Stops.* Does not build.  
3. **Clarification Mode:** Eames analyzes the request against "Product Excellence Principles."  
4. **Eames Output:** "I can build this, but I have three strategic questions first:  
   * Target Audience: Is this for degens or grandmas? The UI patterns are opposite.  
   * Differentiation: There are 500 wallets. What is our hook?  
   * Compliance: Do we need KYC flows?"  
5. **Result:** Eames forces the user to clarify strategy, resulting in a higher quality PRD.

## **4\. The Technical Stack (Hybrid Core)**

We leverage the best of the AI ecosystem to build a "Super-CLI."

* **Runtime:** **Bun** (Speed).  
* **Terminal UI:** **React Ink** (Best-in-class CLI UI).  
  * *Features:* Spinner loaders, Markdown rendering, Select inputs, "Council Session" visualization.  
* **Agent Logic:**  
  * **Claude Agent SDK:** Used for *System Operations* (Bash, File System, MCP connections). It provides the "Shell" capabilities.  
  * **Vercel AI SDK:** Used for *Streaming & Tool Standardization*. It allows us to swap models (OpenAI/Gemini/Anthropic) easily for the Council.  
  * **LangChain:** (Retired in V1.2) \- Replaced by the native capabilities of the two SDKs above to reduce bloat.

## **5\. The "Eames" Identity System**

Eames is not a generic assistant. It is a **Persona**.

* **Voice:** Professional, opinionated but polite, data-driven, empathetic.  
* **Philosophy:** "The details are not the details. They make the design." (Charles Eames).  
* **System Prompt:** (See EAMES\_IDENTITY\_SYSTEM\_PROMPT.md)

## **6\. Project Management Integration**

* **Linear:** Eames uses the Linear MCP to create Issues for every "Plan" item.  
  * *Automation:* When Eames writes a PRD, it auto-generates tickets: \[DES-101\] Design Login Flow, \[DEV-102\] Implement Auth.  
* **Notion:** Eames uses the Notion MCP to publish the PRD.md and INSIGHTS.md to your team wiki.

## **7\. The Workflow (V1.2)**

1. **Intent Phase:** User Request $\\to$ Clarification Loop $\\to$ Strategic Alignment.  
2. **Council Phase:** Research Agent gathers data $\\to$ Strategy Agent writes PRD $\\to$ Creative Director approves vibe.  
3. **Execution Phase (Visual Ralph):** Architect Agent writes code $\\to$ Visual Engine renders $\\to$ Critic Agent reviews.  
4. **Delivery Phase:** Code committed $\\to$ Linear tickets updated $\\to$ Notion Docs synced.