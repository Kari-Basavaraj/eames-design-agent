# **Eames Design Agent v2.0 Architecture with DeepAgents: Technical Documentation Analysis**

## **1\. Executive Summary**

The evolution of autonomous AI systems has necessitated a fundamental shift from monolithic, single-turn interactions to persistent, stateful architectures capable of multi-step reasoning. The Eames Design Agent v2.0 represents a paradigmatic leap in this domain, transitioning from the linear "chain-of-thought" methodologies characterizing v1.0 implementations to a robust "Deep Agent" architecture. This transformation is underpinned by the deepagents framework, a specialized harness built upon the primitives of LangChain and LangGraph.

This report provides a comprehensive technical analysis of the Eames v2.0 architecture. It dissects the structural components that enable the agent to function not merely as a conversational interface, but as an autonomous design researcher and orchestrator. The analysis highlights four critical pillars enabled by the deepagents library: explicit planning mechanisms via todo-list middleware, context-aware virtualization of file systems, hierarchical sub-agent delegation for context isolation, and hybrid memory persistence through composite backends.1 By integrating these components, Eames v2.0 addresses the "shallow agent" limitations—specifically context window saturation and goal drift—thereby establishing a foundation for long-horizon design tasks that span hours or days.4

## **2\. Architectural Paradigm: The Deep Agent Harness**

### **2.1 Transitioning from Shallow Loops to Deep Orchestration**

The primary limitation of first-generation agentic architectures, often described as "shallow loops," lies in their reliance on a single, continuous context stream. In such architectures, an LLM executes a tool, appends the result to the history, and repeats the process. For complex design tasks—such as "Audit the existing design system, identify accessibility violations, and generate remediated React components"—this linear accumulation of data rapidly degrades performance. Tool outputs, such as HTML scrapes or large JSON objects, displace critical system instructions within the context window, leading to "catastrophic forgetting" of the original objective.2

Eames v2.0 circumvents this by adopting the "Deep Agent" harness provided by the deepagents library.6 This harness is not a simple iterator but a compiled LangGraph StateGraph that orchestrates a rigorous cognitive cycle: **Plan → Delegate → Act → Memorize**. This architecture draws architectural inspiration from advanced autonomous systems like Claude Code and Manus, which demonstrated that long-duration autonomy requires the externalization of state.3 By moving the "memory" of the task from the ephemeral context window to structured external artifacts (files and todo lists), Eames v2.0 maintains coherence regardless of the complexity or duration of the design task.

### **2.2 The Graph-Based State Machine**

At the core of the Eames v2.0 architecture is the LangGraph engine. Unlike linear chains, LangGraph models the agent as a state machine where nodes represent computational steps (e.g., model\_node, tools\_node) and edges represent control flow transitions.8

The create\_deep\_agent factory function in the deepagents package initializes this graph with a highly specific AgentState. This state object is the central nervous system of Eames v2.0, persisting data that would otherwise be lost in a stateless LLM call. The AgentState aggregates three distinct data streams:

1. **Message History:** A chronological log of interactions, strictly pruned to contain only high-level reasoning and human-agent dialogue.  
2. **Virtual Filesystem:** A dictionary or pointer-based representation of the design workspace, allowing the agent to "see" the project structure without loading file contents into its context.9  
3. **Task Queue:** A structured, persistent list of tasks managed by the TodoListMiddleware, serving as the agent's "working memory" of its current progress and future obligations.11

This graph-based approach enables "time travel" debugging capabilities via LangSmith. If Eames v2.0 makes a critical error in a design file, developers can rewind the state to the node prior to the erroneous tool call, modify the state or logic, and replay the execution—a capability impossible in linear chain architectures.12

### **2.3 The "Trust the LLM" Security Model**

A defining characteristic of the deepagents harness, and by extension Eames v2.0, is the adoption of a "Trust the LLM" security model.6 This architectural philosophy posits that the agent should be granted broad discretionary power to interact with its environment to fulfill complex requests.

In practice, this means Eames v2.0 is given direct access to a shell (via the execute tool) and a filesystem. Security is not enforced by attempting to prompt-engineer the model into "good behavior," which is prone to jailbreaks. Instead, security boundaries are enforced at the infrastructure level via the **Sandbox Backend**. The FilesystemBackend is configured with a strict root\_dir, effectively chrooting the agent to a specific workspace.10 The agent can create, delete, or modify any file within /project/design-system/, but strictly lacks the privileges to traverse up to the host system’s root. This containment strategy allows Eames v2.0 to be "deeply" capable within its domain while remaining essentially safe for enterprise deployment.6

## **3\. Middleware Architecture Analysis**

The modularity of Eames v2.0 is achieved through the middleware pattern native to deepagents (and introduced in LangChain 1.0). This architecture allows developers to inject interceptors into the agent's execution loop, modifying inputs (prompts) and outputs (tool results) without altering the core reasoning logic.6

### **3.1 The AgentMiddleware Protocol**

The middleware system functions through a standardized interface defined by the AgentMiddleware class. This protocol exposes hooks that bracket the model interaction, specifically before\_model and after\_model.6

Table 1: Key Middleware Hooks in Eames v2.0

| Hook | Direction | Function in Eames v2.0 Architecture |
| :---- | :---- | :---- |
| before\_model | **Input** | Inspects the AgentState and injects contextual instructions into the system prompt. For instance, it reads the current todo list and appends it to the prompt, ensuring the model is "conscious" of its plan before generating the next token.16 |
| after\_model | **Output** | Intercepts tool calls and results. This is critical for the "Context Eviction" strategy, where large outputs (e.g., a 10MB SVG file) are captured and redirected to disk before they can pollute the context window.11 |

This separation of concerns allows Eames v2.0 to stack complex behaviors. A standard configuration might include TodoListMiddleware for planning, FilesystemMiddleware for memory, SubAgentMiddleware for delegation, and AnthropicPromptCachingMiddleware for cost optimization, all operating concurrently within the same graph execution.6

### **3.2 Filesystem Middleware: The Context Eviction Strategy**

One of the most persistent challenges in LLM-driven design is the handling of verbose artifacts. Design research often involves parsing expansive documentation, scraping HTML from competitor sites, or analyzing massive codebases. In a standard architecture, returning a 50,000-token HTML scrape to the agent would immediately overflow the context window or displace the system prompt instructions.

Eames v2.0 utilizes FilesystemMiddleware to implement a **Context Eviction Strategy**.11 The middleware is configured with a tool\_token\_limit\_before\_evict threshold (defaulting to \~20,000 tokens). When a tool execution—such as a web scrape or a file read—generates output exceeding this limit, the middleware intervenes. Instead of passing the raw data to the LLM, it writes the data to a file in the agent's workspace (e.g., /logs/tool\_output\_scraped\_data.txt) and returns a system message:

*"The tool output was too large and has been saved to /logs/tool\_output\_scraped\_data.txt. Use read\_file with offset and limit to read relevant sections."*.11

This mechanism transforms Eames v2.0 from a "stateless processor" into a "stateful operator." The agent learns to interact with data by reference rather than value. To find a specific CSS class in a large stylesheet, it does not read the whole file; it uses the grep tool provided by the middleware to search for the pattern, retrieving only the relevant lines.10 This mirrors the workflow of a human developer using an IDE, minimizing cognitive load (context usage) while maximizing access to information.

### **3.3 TodoList Middleware: Cognitive Scaffolding**

The TodoListMiddleware provides the necessary scaffolding for long-horizon planning. In design workflows, a single user request ("Redesign the dashboard") implies a complex dependency tree of tasks. Without explicit state tracking, LLMs notoriously suffer from "goal drift," where they become distracted by a sub-task (e.g., fixing a specific icon) and forget the broader objective.11

This middleware enforces a "Plan-Execute-Update" loop. The agent is equipped with write\_todos and read\_todos tools. The middleware intercepts the before\_model hook to inject the current state of the todo list into the system prompt. This ensures that at every step of the generation process, the model is presented with its progress:

* \[X\] Audit current colors  
* Generate new palette  
* \[ \] Update CSS variables

This explicit serialization of intent allows Eames v2.0 to survive interruptions. If the server restarts or the context window is truncated, the plan remains persisted in the AgentState, allowing the agent to resume exactly where it left off.6

### **3.4 SubAgent Middleware: Context Quarantine**

The SubAgentMiddleware is the architectural component that enables Eames v2.0 to scale horizontally. It permits the "Main Agent" (Supervisor) to spawn ephemeral child agents for specialized tasks. This capability is termed **Context Quarantine**.7

When Eames v2.0 delegates a task—for example, "Research the history of Bauhaus typography"—to a sub-agent, a new LangGraph instance is spun up. This child agent performs the search, creates intermediate summaries, and potentially executes dozens of internal steps. Crucially, none of these intermediate steps pollute the Supervisor's context window. The child agent returns only the final synthesized report.

This prevents the "context pollution" that plagues single-agent systems. The Main Agent remains lightweight and focused on orchestration, while specialized workers handle the heavy lifting in isolated environments. The SubAgentMiddleware manages the entire lifecycle: spawning the sub-graph, routing the prompt, and reconciling the output back into the main graph.19

## **4\. Storage & State Management Strategies**

The viability of Eames v2.0 as a continuous digital worker depends on its ability to persist state effectively. The deepagents harness abstracts storage via a BackendProtocol, offering a tiered memory architecture that balances speed, persistence, and security.

### **4.1 Pluggable Backend Architecture**

The system supports four distinct backend types, which can be mixed and matched to suit specific deployment needs.9

Table 2: Backend Storage Strategies in Eames v2.0

| Backend Implementation | Persistence Scope | Mechanism | Application in Design Agent |
| :---- | :---- | :---- | :---- |
| **StateBackend** | Thread-Ephemeral | In-memory within AgentState. | Scratchpad for temporary CSS calculations or reasoning notes. Disappears when the thread ends. |
| **FilesystemBackend** | Disk-Persistent | Direct I/O to local disk. | Storing tangible design assets (HTML, SVG, images) that the user must access. |
| **StoreBackend** | Cross-Thread (DB) | LangGraph BaseStore (Postgres/Redis). | "Long-term Memory." Storing user brand guidelines, design system tokens, and preferences. |
| **CompositeBackend** | Routing-Based | Path-based multiplexer. | The master controller mapping virtual paths to the above backends. |

### **4.2 The Composite Backend: Implementing Hybrid Memory**

To achieve a production-grade architecture, Eames v2.0 employs the CompositeBackend. This sophisticated router allows the agent to interact with a unified virtual filesystem hierarchy where different directory paths map to physically distinct storage technologies.5

The configuration enables a hybrid memory model:

Python

from deepagents.backends import CompositeBackend, StateBackend, FilesystemBackend, StoreBackend

\# Eames v2.0 Backend Configuration  
backend \= CompositeBackend(  
    default=StateBackend(runtime), \# Root / maps to ephemeral memory  
    routes={  
        "/project/": FilesystemBackend(root\_dir="./user\_project"), \# /project maps to real disk  
        "/memories/": StoreBackend(runtime) \# /memories maps to database (Long-term)  
    }  
)

*Analysis:* This routing logic implies a powerful cognitive model. When Eames writes to /project/index.html, the file is physically created on the user's disk, making it immediately usable. However, when Eames identifies a user preference (e.g., "The user prefers 8px border radiuses"), it writes this insight to /memories/style\_guide.txt. Because this path is routed to StoreBackend, the data is serialized into a database (like Postgres). In a *future* conversation, even months later, Eames can retrieve this file, effectively "remembering" the user's preferences across sessions.5

### **4.3 Virtualization and Security**

The FilesystemBackend operates in virtual\_mode=True by default in secure deployments. This mode creates a chroot-like environment, sandboxing the agent to its specific root\_dir. The backend normalizes all paths and checks for traversal attempts (e.g., ../../etc/passwd) before execution, ensuring the agent cannot escape its designated workspace.10 Additionally, the backend integrates with system-level tools like ripgrep. When the agent executes a grep command, the backend delegates this to the optimized binary rather than loading files into Python, enabling sub-second search times across massive repositories.10

## **5\. Sub-Agent Hierarchies & Delegation Patterns**

The "Deep" capability of Eames v2.0 is functionally realized through its hierarchical delegation patterns. The system is not a solitary agent but a constellation of specialized intelligences managed by a supervisor.

### **5.1 Defining the Sub-Agent Constellation**

Sub-agents are defined using a strict schema (TypedDict in Python, Interface in TypeScript) which dictates their capabilities and psychological framing.7 For Eames v2.0, the constellation typically consists of:

1. **The Supervisor (Main Agent):**  
   * *Role:* Orchestrator and Planner.  
   * *Tools:* task (delegation), write\_todos, read\_file (high-level review).  
   * *Prompting:* Focused on requirements gathering, plan decomposition, and final synthesis. It does not write code or search the web directly if a sub-agent is available.  
2. **The Design Researcher:**  
   * *Role:* Information Retrieval and Synthesis.  
   * *Tools:* internet\_search (Tavily/Perplexity), read\_page, scrape\_url.  
   * *Prompting:* "You are a rigorous researcher. Verify all design trends with citations. Focus on extracting color codes and typography specs.".19  
3. **The Implementation Specialist (Coder):**  
   * *Role:* Asset Generation.  
   * *Tools:* write\_file, edit\_file, execute (shell commands).  
   * *Prompting:* "You are a senior frontend engineer. Ensure all code is accessible (WCAG AA). Prefer functional components.".19

### **5.2 The "General Purpose" Fallback**

The deepagents harness includes a "general-purpose" sub-agent by default. This agent serves as a clone of the supervisor but with a fresh, empty context window. The Supervisor utilizes this agent for tasks that are complex but generic, such as "Summarize this 100-page PDF." By delegating this to the general sub-agent, the processing tokens and intermediate steps (reading chunks, summarizing sections) are contained within the sub-agent's ephemeral graph, preventing the Supervisor's context from being flooded with raw text.7

### **5.3 The Filesystem Handoff Protocol**

A critical architectural insight is the mechanism of data transfer between agents. Since sub-agents operate in isolated memory spaces, they cannot modify the Supervisor's variables directly. Instead, Eames v2.0 utilizes the **Filesystem Handoff Protocol**.22

In this pattern, the filesystem acts as the shared state:

1. **Delegation:** The Supervisor instructs the Researcher: "Find the HEX codes for the 2025 Pantone Color of the Year and save them to /project/colors.json."  
2. **Execution:** The Researcher performs the search, formats the data, and writes the file to the shared volume via FilesystemBackend.  
3. **Signal:** The Researcher returns a terse string message: "Task complete. Data saved to /project/colors.json."  
4. **Retrieval:** The Supervisor reads the file (or passes the path to the Coder agent) to proceed.

This mimics human collaboration workflows (passing documents) and ensures that heavy payloads are passed by reference, maintaining token efficiency across the swarm.22

## **6\. Human-in-the-Loop (HITL) Integration**

Eames v2.0 is engineered for professional environments where unbridled autonomy poses risks (e.g., overwriting production code). The deepagents harness integrates LangGraph's native interruption primitives via the HumanInTheLoopMiddleware.6

### **6.1 Configuring Interruptions**

The create\_deep\_agent factory accepts an interrupt\_on configuration object. This allows the system architect to define specific "breakpoints" based on tool usage.6

Python

\# Eames v2.0 HITL Configuration  
agent \= create\_deep\_agent(  
    tools=\[deploy\_to\_production, delete\_file, write\_file\],  
    interrupt\_on={  
        "deploy\_to\_production": {"allowed\_decisions": \["approve", "reject"\]},  
        "delete\_file": {"allowed\_decisions": \["approve", "edit", "reject"\]}  
    }  
)

In this configuration, Eames v2.0 operates autonomously during the *creative* phase (using write\_file to draft designs). However, if the agent attempts a destructive action (delete\_file) or a cost-incurring action (deploy\_to\_production), the HumanInTheLoopMiddleware triggers a suspension of the graph. The state is checkpointed, and the execution halts until an API call injects a human decision (approve, reject, or edit arguments).6 This "Safety Valve" architecture ensures that the agent serves as a co-pilot rather than an uncontrolled operator.

## **7\. Implementation Specification: Eames v2.0**

This section synthesizes the architectural components into a coherent specification for building the Eames v2.0 system.

### **7.1 Technical Stack & Dependencies**

The implementation relies on a modern Python or Node.js stack, leveraging the latest advancements in the LangChain ecosystem.

* **Runtime:** Python 3.11+ is recommended for optimal async performance and type safety.24 Node.js 20+ is required for the JavaScript implementation.25  
* **Core Frameworks:** deepagents (Harness), langgraph (Orchestration), langchain-core (Primitives).26  
* **Tooling Layer:** tavily-python for search capabilities; langchain-mcp-adapters for integrating with external Model Context Protocol servers (e.g., connecting to a Figma API via MCP).6  
* **Observability:** LangSmith is strictly required for tracing the complex, recursive graph executions and debugging state transitions.1

### **7.2 System Prompt Architecture**

The system prompt for Eames v2.0 is not a static string but a dynamic artifact composed at runtime. deepagents utilizes a composite prompting strategy.6

1. **Identity Layer:** "You are Eames, an expert design agent..." (Defined via system\_prompt arg).  
2. **Middleware Injection Layer:** The active middlewares automatically append their instruction sets:  
   * *Filesystem:* "You have access to a filesystem. Use ls to explore. Use read\_file with limits for large files..."  
   * *Planning:* "You must manage a todo list. Update it via write\_todos before taking action..."  
   * *Delegation:* "To perform complex research, use the task tool..."  
3. **Context Layer:** Real-time data from the AgentState (e.g., the current list of pending todos) is injected into the prompt context on every turn.6

### **7.3 Integration with Model Context Protocol (MCP)**

Eames v2.0 achieves tool-agnosticism through the Model Context Protocol (MCP). By using langchain-mcp-adapters, Eames can connect to MCP servers running locally or remotely. For example, a "Figma MCP Server" can expose tools like get\_component or update\_layer to Eames. The agent interacts with these as standard Python functions, while the MCP adapter handles the underlying JSON-RPC communication. This decouples the agent's logic from the specific API implementations of the tools it uses.6

## **8\. Observability and Evaluation**

The recursive and non-deterministic nature of Deep Agents makes "black box" operation unacceptable. Eames v2.0 relies on LangSmith to provide "X-Ray" visibility into the execution graph.

### **8.1 Tracing Recursive Execution**

A single high-level command to Eames v2.0 (e.g., "Create a dark mode version of the landing page") can trigger a cascade of 50+ graph steps involving multiple sub-agents. LangSmith traces these interactions as nested runs.

* **Root Run:** The Supervisor receiving the request and planning.  
* **Child Runs:** The Sub-Agents (e.g., "Research Agent") spinning up their own graphs.  
* **Leaf Runs:** Individual tool calls (e.g., read\_file, llm\_generation).

This hierarchical tracing allows developers to pinpoint exactly where a failure occurred—for example, identifying that the "Coder Agent" failed because it tried to read a file that the "Research Agent" forgot to create.12

### **8.2 Debugging State Transitions**

Since Eames v2.0 is a state machine, debugging is fundamentally about inspecting state transitions. LangGraph persists the AgentState at every "super-step." If the agent enters an infinite loop, the developer can inspect the checkpoint history to see that the todos list is not being updated (e.g., the agent keeps marking a task as "in\_progress" but never "completed"). This visibility allows for precise prompt engineering fixes or logic adjustments in the middleware.11

## **9\. Future Roadmap and Limitations**

While the deepagents architecture provides a robust foundation, several limitations and areas for optimization have been identified.

* **Latency & Token Cost:** The "Deep" architecture is inherently token-intensive. Every sub-agent instantiation involves a new system prompt handshake. For simple queries (e.g., "What time is it?"), this overhead is inefficient compared to a shallow chain.29 Future versions of Eames may implement "Auto-Routing," using a lightweight classifier model to determine if a request requires the full Deep Agent harness or a simple direct response.  
* **Prompt Caching Optimization:** To mitigate the cost of re-sending the massive system prompt (which includes file system instructions, todo lists, and persona definitions) on every turn, Eames v2.0 relies on the AnthropicPromptCachingMiddleware. This leverages the prompt caching features of models like Claude 3.5 Sonnet to cache the static prefix of the prompt, significantly reducing latency and cost for long-running sessions.6  
* **Eventual Consistency in Filesystem Handoffs:** The reliance on the filesystem for inter-agent communication introduces a risk of consistency errors. If a sub-agent writes a file but the write is interrupted or corrupted, the main agent may hallucinate the content or fail to read it. Robust error handling wrappers around read\_file and write\_file tools are essential to ensure the agent can recover from I/O failures gracefully.30

## **10\. Conclusion**

The Eames Design Agent v2.0 architecture, built upon the deepagents framework, represents a mature implementation of agentic AI suitable for enterprise deployment. By transcending the limitations of the single-loop paradigm and embracing a graph-based, persistent, and hierarchical structure, it solves the fundamental challenges of context management and long-horizon planning.

The strategic use of CompositeBackend creates a nuanced memory model that mimics human cognition—balancing working memory (RAM), project artifacts (Disk), and long-term knowledge (Database). The FilesystemMiddleware effectively virtualizes the agent's environment, allowing it to interact with massive datasets without overwhelming its cognitive core. Finally, the strict AgentMiddleware protocol ensures that as Eames evolves with new capabilities—such as visual perception or direct codebase manipulation—the core orchestration logic remains stable, secure, and observable. This analysis confirms that deepagents provides the necessary primitives to build "Deep" applications that are not merely chatbots, but capable, stateful digital coworkers.

#### **Works cited**

1. Deep Agents overview \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/deepagents/overview](https://docs.langchain.com/oss/javascript/deepagents/overview)  
2. langchain-ai/deepagentsjs: Deep Agents in JS \- GitHub, accessed on January 18, 2026, [https://github.com/langchain-ai/deepagentsjs](https://github.com/langchain-ai/deepagentsjs)  
3. Deep Agents overview \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/python/deepagents/overview](https://docs.langchain.com/oss/python/deepagents/overview)  
4. Deep Agents in LangChain: Building the Next Generation of Autonomous AI Systems with LangGraph | by Michiel Horstman | Dec, 2025, accessed on January 18, 2026, [https://michielh.medium.com/deep-agents-in-langchain-building-the-next-generation-of-autonomous-ai-systems-with-langgraph-3787b67e1805](https://michielh.medium.com/deep-agents-in-langchain-building-the-next-generation-of-autonomous-ai-systems-with-langgraph-3787b67e1805)  
5. Agents 2.0: From Shallow Loops to Deep Agents \- Towards AI, accessed on January 18, 2026, [https://towardsai.net/p/machine-learning/agents-2-0-from-shallow-loops-to-deep-agents](https://towardsai.net/p/machine-learning/agents-2-0-from-shallow-loops-to-deep-agents)  
6. GitHub \- langchain-ai/deepagents: Deep Agents is an agent harness built on langchain and langgraph. Deep Agents are equipped with a planning tool, a filesystem backend, and the ability to spawn subagents, accessed on January 18, 2026, [https://github.com/langchain-ai/deepagents](https://github.com/langchain-ai/deepagents)  
7. Shelex/deepagents-ts \- GitHub, accessed on January 18, 2026, [https://github.com/Shelex/deepagents-ts](https://github.com/Shelex/deepagents-ts)  
8. Graph API overview \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/python/langgraph/graph-api](https://docs.langchain.com/oss/python/langgraph/graph-api)  
9. Backends \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/python/deepagents/backends](https://docs.langchain.com/oss/python/deepagents/backends)  
10. Backends \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/deepagents/backends](https://docs.langchain.com/oss/javascript/deepagents/backends)  
11. Agent harness capabilities \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/python/deepagents/harness](https://docs.langchain.com/oss/python/deepagents/harness)  
12. LangChain overview \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/langchain/overview](https://docs.langchain.com/oss/javascript/langchain/overview)  
13. Building AI Agents with LangGraph (2026 Edition): A Step-by-Step Guide \- AI Advances, accessed on January 18, 2026, [https://ai.gopubby.com/building-ai-agents-with-langgraph-2026-edition-a-step-by-step-guide-494d36e801f9](https://ai.gopubby.com/building-ai-agents-with-langgraph-2026-edition-a-step-by-step-guide-494d36e801f9)  
14. Backends \- Docs by LangChain, accessed on January 18, 2026, [https://langchain-5e9cc07a.mintlify.app/oss/javascript/deepagents/backends](https://langchain-5e9cc07a.mintlify.app/oss/javascript/deepagents/backends)  
15. Building Production-Ready Deep Agents with LangChain 1.0 | by Debal B \- Medium, accessed on January 18, 2026, [https://medium.com/data-science-collective/building-deep-agents-with-langchain-1-0s-middleware-architecture-7fdbb3e47123](https://medium.com/data-science-collective/building-deep-agents-with-langchain-1-0s-middleware-architecture-7fdbb3e47123)  
16. Building Enterprise-Grade Multi-Agent Systems: Mastering LangChain's Middleware Framework & Deep… \- GoPenAI, accessed on January 18, 2026, [https://blog.gopenai.com/building-enterprise-grade-multi-agent-systems-mastering-langchains-middleware-framework-deep-72eb41d2dd70](https://blog.gopenai.com/building-enterprise-grade-multi-agent-systems-mastering-langchains-middleware-framework-deep-72eb41d2dd70)  
17. deepagents/libs/deepagents/deepagents/middleware/filesystem.py at master · langchain-ai/deepagents \- GitHub, accessed on January 18, 2026, [https://github.com/langchain-ai/deepagents/blob/master/libs/deepagents/deepagents/middleware/filesystem.py](https://github.com/langchain-ai/deepagents/blob/master/libs/deepagents/deepagents/middleware/filesystem.py)  
18. Built a Deep Agent framework using Vercel's AI SDK (zero LangChain dependencies), accessed on January 18, 2026, [https://www.reddit.com/r/LangChain/comments/1p98aqs/built\_a\_deep\_agent\_framework\_using\_vercels\_ai\_sdk/](https://www.reddit.com/r/LangChain/comments/1p98aqs/built_a_deep_agent_framework_using_vercels_ai_sdk/)  
19. Subagents \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/python/deepagents/subagents](https://docs.langchain.com/oss/python/deepagents/subagents)  
20. Has anyone implemented Deepagents with a longterm memory like postgres? \- LangChain, accessed on January 18, 2026, [https://forum.langchain.com/t/has-anyone-implemented-deepagents-with-a-longterm-memory-like-postgres/2551](https://forum.langchain.com/t/has-anyone-implemented-deepagents-with-a-longterm-memory-like-postgres/2551)  
21. LangChain's Deep Agents: A Guide With Demo Project \- DataCamp, accessed on January 18, 2026, [https://www.datacamp.com/tutorial/deep-agents](https://www.datacamp.com/tutorial/deep-agents)  
22. Deep Agents Explained: Building AI That Plans, Delegates & Executes \- Sharmasaravanan, accessed on January 18, 2026, [https://sharmasaravanan.medium.com/deep-agents-explained-building-ai-that-plans-delegates-executes-92d5e695c5e0](https://sharmasaravanan.medium.com/deep-agents-explained-building-ai-that-plans-delegates-executes-92d5e695c5e0)  
23. Building Smarter Agents: A Human-in-the-Loop Guide to LangGraph, accessed on January 18, 2026, [https://oleg-dubetcky.medium.com/building-smarter-agents-a-human-in-the-loop-guide-to-langgraph-dfe1673d8b7b](https://oleg-dubetcky.medium.com/building-smarter-agents-a-human-in-the-loop-guide-to-langgraph-dfe1673d8b7b)  
24. Deep Agents Part 4: Usage, Integration, and Future Roadmap | Colin McNamara, accessed on January 18, 2026, [https://colinmcnamara.com/blog/deep-agents-part-4-usage-integration-roadmap](https://colinmcnamara.com/blog/deep-agents-part-4-usage-integration-roadmap)  
25. LangChain v1 migration guide, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/migrate/langchain-v1](https://docs.langchain.com/oss/javascript/migrate/langchain-v1)  
26. Quickstart \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/deepagents/quickstart](https://docs.langchain.com/oss/javascript/deepagents/quickstart)  
27. Building Smart Web AI Agents with MCP, LangGraph & FastAPI, accessed on January 18, 2026, [https://sgino209.medium.com/building-smart-web-ai-agents-with-mcp-langgraph-fastapi-da2734fe5256](https://sgino209.medium.com/building-smart-web-ai-agents-with-mcp-langgraph-fastapi-da2734fe5256)  
28. How to Continuously Improve Your LangGraph Multi-Agent System \- Galileo AI, accessed on January 18, 2026, [https://galileo.ai/blog/evaluate-langgraph-multi-agent-telecom](https://galileo.ai/blog/evaluate-langgraph-multi-agent-telecom)  
29. Choosing the Right Multi-Agent Architecture \- LangChain Blog, accessed on January 18, 2026, [https://www.blog.langchain.com/choosing-the-right-multi-agent-architecture/](https://www.blog.langchain.com/choosing-the-right-multi-agent-architecture/)  
30. Built-in middleware \- Docs by LangChain, accessed on January 18, 2026, [https://docs.langchain.com/oss/javascript/langchain/middleware/built-in](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in)