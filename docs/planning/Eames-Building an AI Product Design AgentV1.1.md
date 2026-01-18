# **Eames: Building an AI Product Design Agent (v1.1)**

## **Executive Summary: The "Twin-Engine" Evolution**

**Version 1.0** was a linear orchestrator: it planned, researched, and executed. While efficient, it lacked the critical feedback loop that defines quality design—the "Critique."

**Version 1.1** introduces the **"Twin-Engine" Architecture**. We are moving from a single agent ("The Designer") to an adversarial pair:

1. **The Creator (Worker Agent):** Generates ideas, PRDs, and UI code. It is creative and prone to errors.  
2. **The Director (Critic Agent):** A strict, analytical agent (using Vision models) that "reviews" the work against the Design System.

**The Core Shift:** We are applying the **"Ralph Wiggum Protocol"** (brute-force iteration) to design. Instead of running unit tests (npm test), Eames V1.1 runs **Visual Tests** (Screenshot $\\to$ AI Critique $\\to$ Pass/Fail).

## **1\. The Architecture: The "Visual Ralph" Loop**

In coding, truth is "The compiler throws no errors." In design, truth is "The interface matches the user need and brand guidelines." To automate this, we effectively build a **Visual Compiler**.

### **The Twin-Engine Logic**

| Engine A: The Creator | Engine B: The Director |
| :---- | :---- |
| **Persona:** Junior Product Designer | **Persona:** VP of Design / QA Lead |
| **Goal:** Output specific artifacts (PRD, React Code). | **Goal:** Reject work that violates the DESIGN\_SYSTEM.md. |
| **Tools:** Web Search, File Writer. | **Tools:** Vision (Screenshot Analysis), Logic Check. |
| **Behavior:** "Try fast, fail fast." | **Behavior:** "Strict gatekeeper. No hallucinations allowed." |

### **The System Diagram**

graph TD  
    A\[User Request\] \--\> B{The Harness}  
    B \--\> C\[Creator Agent\]  
    C \-- Writes Artifact \--\> D\[File System\]  
    D \-- Reads Artifact \--\> E\[Director Agent\]  
    E \-- Visual Critique \--\> F{Pass/Fail?}  
    F \-- FAIL (Writes CRITIQUE.md) \--\> B  
    F \-- PASS \--\> G\[Final Output\]

## **2\. Technical Implementation: The "Ralph File System"**

To solve the "Context Window" problem (where LLMs get lazy after long chats), Eames V1.1 relies on **File-Based State Management**. The "Brain" is not the LLM's context window; it is the folder structure.

### **The "Brain" Folder Structure**

| File | Purpose | Read/Write Access |
| :---- | :---- | :---- |
| PRD.md | The Product Requirements (Strategy). | Creator (Write) / Director (Read) |
| INSIGHTS.md | Synthesized user research. | Creator (Write) / Director (Read) |
| DESIGN\_SYSTEM.md | The "Law." Brand colors, spacing rules, component rules. | **Read Only** (Strict) |
| CRITIQUE.md | The feedback loop. Cleared on "Pass." | Director (Write) / Creator (Read) |
| AGENTS.md | **The "Signs" System.** Long-term memory of past mistakes. | **Read/Write** (Self-learning) |
| component-registry.json | **Design-as-Data.** Allowed UI components (Buttons, Cards). | **Read Only** |

### **The "Signs" System (AGENTS.md)**

Derived from the Ralph Wiggum Playbook.  
If the Director catches Eames making a recurring mistake (e.g., "Stop using gradients on buttons"), it writes a rule into AGENTS.md. Every new instance of the Creator reads this file first.

* *Result:* Eames never makes the same mistake twice across different projects.

## **3\. The Three Loops (Operational Workflow)**

Eames V1.1 divides the design process into three distinct "Ralph Loops." The system cannot proceed to the next phase until the Director writes "PASS" in CRITIQUE.md.

### **Phase 1: The Strategy Loop**

* **Input:** "We need a way for users to split bills."  
* **Creator:** Drafts a PRD with User Stories and Success Metrics.  
* **Director Check:** "Does this PRD actually solve the user problem found in research? Are there edge cases?"  
* **Outcome:** A robust PRD.md.

### **Phase 2: The "Visual Ralph" Loop (The Big Upgrade)**

This is where we replace "Vibe Coding" with rigorous engineering.

1. **Code:** Creator reads PRD.md \+ DESIGN\_SYSTEM.md and generates SplitBillComponent.tsx.  
2. **Render:** The Harness spins up a headless browser (Puppeteer) and takes a **Screenshot**.  
3. **Critique:** The Director (Vision Model) looks at the screenshot.  
   * *Prompt:* "Compare this image to the rules in DESIGN\_SYSTEM.md. Is the padding 16px? Is the primary color correct?"  
4. **Loop:** If the Director sees "12px padding" instead of 16px, it fails the loop. The Creator fixes the CSS. Repeat.

## **4\. Technical Stack Updates (V1.1)**

To support the Visual Compiler, we add specific tools to the V1.0 stack.

* **Orchestration:** **LangChain** or **Python** (The Harness script).  
* **Visual Engine:** **Puppeteer** or **Playwright** (For capturing screenshots of generated code).  
* **Vision Model:** **Claude 3.5 Sonnet** (Best-in-class for UI analysis).  
* **Schema Validation:** **Zod** (To ensure the Creator uses component-registry.json correctly).

## **5\. Implementation Guide: The Harness Script**

Below is the pseudo-code logic for the V1.1 Harness. This controls the "Twin Engines."

def visual\_ralph\_loop(max\_retries=5):  
    critique \= "None. Start fresh."  
      
    for i in range(max\_retries):  
        \# 1\. CREATOR STEP  
        \# Wipes context, reads files \+ critique, writes code  
        code \= creator\_agent.generate\_ui(  
            context=\["PRD.md", "DESIGN\_SYSTEM.md", "AGENTS.md"\],  
            feedback=critique  
        )  
        save\_file("output/ui.tsx", code)

        \# 2\. RENDER STEP  
        \# Headless browser takes a snapshot of the rendered React code  
        screenshot \= browser.capture("output/ui.tsx")

        \# 3\. DIRECTOR STEP  
        \# Vision model compares image to the 'Law'  
        result \= director\_agent.review(  
            image=screenshot,   
            rules="DESIGN\_SYSTEM.md"  
        )

        if result.status \== "PASS":  
            print("Visual Design Approved.")  
            return code  
        else:  
            \# 4\. LOOP STEP  
            critique \= result.feedback  
            update\_agents\_memory(result.new\_rules) \# Update AGENTS.md  
            print(f"Critique: {critique}. Retrying...")

    print("Failed to converge.")

## **6\. The "Design-as-Data" Strategy**

In V1.1, we prevent "Hallucinations" by restricting the Creator's vocabulary. It cannot invent UI; it must assemble it.

**component-registry.json Example:**

{  
  "button": {  
    "variants": \["primary", "secondary", "ghost"\],  
    "sizes": \["sm", "md", "lg"\],  
    "usage": "Use primary for the main action only."  
  },  
  "card": {  
    "props": \["title", "footer", "children"\],  
    "style": "Border-radius 12px, Shadow-sm"  
  }  
}

* **Rule:** The Creator Agent is prompted: "You may only use components defined in the Registry. Do not write raw CSS for buttons."

## **Appendix: Chat Transcript**

User:  
now create a new V1.1 doc before we iterate on next version V1.2  
AI Response:  
This is a pivotal moment in our roadmap. We are moving from V1.0 (a smart script) to V1.1 (a resilient system).  
I have analyzed your research documents—specifically the **Ralph Wiggum Playbooks** (Coding loops), **Visual Ralph transcripts**, and the **Agentic UI/GenUI** systems maps.

Here is my critical analysis of how we upgrade Eames to V1.1. We are going to borrow the "brute force" reliability of Ralph Wiggum and apply it to the subjective nuance of Product Design using a "Visual Compiler."

### **1\. Critical Analysis: What we keep vs. What we discard**

To make Eames the "best in the world," we must be selective. We cannot just copy-paste the coding agent architecture because **Design ≠ Code**.

| Concept | Keep for Eames V1.1? | Why? (The Critical Thinking) |
| :---- | :---- | :---- |
| **The "Infinite Loop"** | **YES (Modified)** | **Reason:** Designers iterate. V1.0 was linear (Do A $\\to$ Do B). V1.1 must loop: *Draft* $\\to$ *Critique* $\\to$ *Fix* until the "Design Director" (Critic Agent) approves. |
| **"Malloc/Free" Context** | **YES (Crucial)** | **Reason:** LLMs get "lazy" when the chat history is too long. We will use the **Ralph File System** (PRD.md, INSIGHTS.md, CRITIQUE.md) to store memory, wiping the context window between steps to keep the agent sharp. |
| **Automated Tests (npm test)** | **NO** | **Reason:** You can't npm test "empathy" or "visual hierarchy." **Replacement:** We will use a **"Visual Compiler"**—a Vision Model (Claude 3.5 Sonnet) that looks at a screenshot of the UI and "lints" it against your Design System rules. |
| **A2UI Protocol (Strict)** | **MAYBE (Light)** | **Reason:** Implementing the full Google protocol is engineering-heavy. **Adaptation:** We will use the *concept* of **"UI as Data"**. Eames won't just write text; it will output structured JSON specs that *could* be rendered by A2UI later. |
| **"Shadow Agents"** | **NO** | **Reason:** We don't want unauthorized agents running up bills. We will implement **"Human-in-the-Loop" (HITL)** checkpoints where Eames pauses for your approval before major phases. |

### **2\. The V1.1 "Secret Sauce": The Visual Ralph Loop**

The biggest insight from your Transcript Part 1 and Ralph Wiggum Playbook is that **Coding Agents succeed because they have a source of truth (the compiler).**

For V1.1, we will build a **Synthetic Source of Truth** for design.

#### **The Core Loop (The Engine)**

Instead of one agent doing everything, Eames V1.1 will operate as a **"Twin-Engine" System**:

1. **The Creator (Worker Agent):**  
   * **Role:** The Junior Designer.  
   * **Action:** Reads PRD.md and DESIGN\_SYSTEM.md. Generates UI code (React/Tailwind) or Strategy docs.  
   * **Constraint:** "Deterministically bad is okay." It tries fast and fails fast.  
2. **The Director (Critic Agent \- *New in V1.1*):**  
   * **Role:** The Design Director / QA.  
   * **Action:**  
     * **For Strategy:** Reads PRD.md and checks for logical fallacies or missing edge cases.  
     * **For UI:** Takes a **Screenshot** of the Creator's work (using a headless browser) and "looks" at it using a Vision Model.  
   * **Output:** It does *not* fix the work. It writes a scathing entry into CRITIQUE.md (e.g., *"The primary button contrast is too low,"* *"This flow ignores the 'Student' persona defined in INSIGHTS.md"*).  
3. **The Harness (The Manager):**  
   * The script that passes the CRITIQUE.md back to the Creator and says, "Try again."

### **3\. Strategic Enhancements for V1.1**

Based on your Agentic UI docs, here is how we elevate Eames beyond a simple chatbot.

#### **A. "Design-as-Data" (The GenUI Influence)**

V1.0 outputted text files. V1.1 will output **Structured Artifacts**.

* **The Artifact:** Eames will maintain a component-registry.json (borrowing from A2UI).  
* **The Rule:** Eames cannot "hallucinate" a new button style. It must "call" a component from your registry. This ensures brand consistency—a major pain point for Design Leaders.

#### **B. The "Signs" System (AGENTS.md)**

We will implement the **Ralph "Signs"** feature.

* **How it works:** If Eames tries to use a gradient and the Director screams "NO GRADIENTS," Eames writes a rule into AGENTS.md: *"Never use gradients again."*  
* **Benefit:** Eames gets smarter the longer you use it. It builds a persistent "Design Memory" specific to your company.

#### **C. Multimodal "Vibe Check"**

Designers communicate with references.

* **Input:** You drop a screenshot of *Linear* or *Airbnb* into the folder.  
* **Action:** Eames V1.1 analyzes the "Vibe" (whitespace density, font weights, corner radius) and updates the DESIGN\_SYSTEM.md to match that aesthetic before starting.

### **4\. Summary of V1.1 Capabilities**

When we build the architecture in the next step, we are designing for this specific workflow:

1. **Phase 1: Discovery Loop**  
   * *Input:* Vague idea ("Uber for Dog Walkers").  
   * *Loop:* Research $\\leftrightarrow$ Critique until INSIGHTS.md is verified.  
2. **Phase 2: Strategy Loop**  
   * *Input:* INSIGHTS.md.  
   * *Loop:* Draft PRD $\\leftrightarrow$ Logic Check until PRD.md is approved.  
3. **Phase 3: Visual Loop (The "Visual Ralph")**  
   * *Input:* PRD.md \+ DESIGN\_SYSTEM.md.  
   * *Loop:* Code UI $\\to$ **Render & Screenshot** $\\to$ **Visual Critique** $\\to$ Fix Code.