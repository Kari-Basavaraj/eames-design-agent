# The Agentic UI Stack: A Systems Map for AI-Native Interfaces

Agentic UI represents a fundamental shift from human-designed to AI-generated interfaces—a paradigm where autonomous agents don't just assist users but actively construct the interface itself. Three complementary open protocols now form the backbone of this emerging stack: **A2UI** (Google's declarative UI specification), **AG-UI** (CopilotKit's agent-frontend runtime), and **A2A** (the agent-to-agent coordination layer). Together, they enable full-stack agentic applications where LLMs stream interactive components—forms, dashboards, multi-step workflows—directly to users across web, mobile, and desktop platforms, all while maintaining security through a "data, not code" design philosophy.

This report provides a systems-level map of how agentic AI meets generative UI. It covers conceptual foundations, protocol specifications, framework implementations, architecture patterns, and actionable design guidance. The intended audience includes product managers, UX designers, and engineers evaluating this technology for production systems.

---

## Agentic AI transforms interfaces from static artifacts to dynamic compositions

**Agentic AI** refers to systems that plan, decide, and act autonomously to achieve goals—distinct from generative AI, which creates content in response to prompts. The difference matters for UI: generative AI produces outputs (text, images), while agentic AI orchestrates multi-step workflows, calls tools, maintains memory, and adapts based on outcomes. When agentic AI meets generative UI, the result is interfaces that compose themselves around user intent rather than forcing users through predetermined flows.

**Generative UI** describes interfaces specified as structured outputs (typically JSON schemas) that clients render using native components. Rather than an LLM generating HTML or executable code, it produces declarative descriptions—"show a Card with these fields"—which a trusted client-side renderer maps to platform-appropriate widgets. This separation is the key security insight: data crosses trust boundaries, not code.

The paradigm shift can be characterized through three eras. The first era treated AI as a feature—search autocomplete, recommendation widgets hidden behind specific functions. The second era (2022-2023) positioned AI as a tool accessed through chat interfaces alongside traditional UI. The current era establishes AI as the interface itself, where the AI layer becomes the primary interaction surface. Jakob Nielsen calls this the "intent-based paradigm": users express desired outcomes, and the system determines how to accomplish them.

**The interface dilemma** for multimodal LLMs centers on a contradiction: we have models capable of processing text, images, audio, and actions, but unclear conventions for how users should interact across these modalities coherently. Four integration patterns have emerged. The first places a chatbot alongside traditional GUI (weakest integration). The second achieves strong cohesion where GUI and linguistic UI stay synchronized. The third deploys generic super-assistants operating atop existing applications. The fourth enables fully generative interfaces where AI constructs both content and container—the frontier where most current R&D is focused.

---

## A2UI, AG-UI, and A2A form a complementary protocol stack

The agentic interface ecosystem has converged on three protocols that handle different layers of the stack. Understanding their distinct responsibilities clarifies how to architect full-stack agentic applications.

**A2UI (Agent-to-User Interface Protocol)**, released by Google in December 2025 at version 0.8, provides the declarative specification for what UI should be rendered. An agent generates JSON messages describing surfaces (containers) and components (widgets), which clients render using their own native UI frameworks. The core innovation is a flat adjacency-list structure optimized for how Transformers generate output—each component has an ID, type, and properties, with parent-child relationships expressed through ID references rather than deep nesting. This makes incremental generation and error correction significantly easier for LLMs.

A2UI separates concerns into three layers: UI structure (component definitions via `surfaceUpdate` messages), application state (data model via `dataModelUpdate` messages), and client rendering (native component mapping). The security model achieves safety through declarativeness—agents can only reference components from a client-controlled "catalog" of pre-approved widgets. No arbitrary HTML or JavaScript can cross the trust boundary. This design enables remote agents in multi-agent systems to generate UI safely across organizational boundaries.

**AG-UI (Agent-User Interaction Protocol)**, developed by CopilotKit and now adopted by Microsoft, Oracle, LangChain, and others, handles the runtime connection between agent backends and user-facing frontends. It's an event-based protocol defining approximately 16 standard event types: `RUN_STARTED`, `TEXT_MESSAGE_CONTENT`, `TOOL_CALL_ARGS`, `STATE_DELTA`, `INTERRUPT`, and others. Where A2UI specifies what to render, AG-UI specifies how agent and client communicate in real-time.

AG-UI solves problems that traditional REST/GraphQL APIs fail to address for agentic applications. Agents are long-running and stream intermediate work. They're nondeterministic and may control UI unpredictably. They mix structured and unstructured I/O. They need user-interactive composition with sub-agents and recursion. The protocol supports bi-directional state synchronization, enabling agents to both read from and write to application state, with JSON Patch for efficient delta updates.

**A2A (Agent-to-Agent Protocol)**, donated by Google to the Linux Foundation, enables communication between independent, potentially opaque agent systems. It provides discovery via Agent Cards (JSON metadata advertising capabilities, authentication requirements, and skills), task lifecycle management (submitted → working → completed/failed), and supports multiple transport bindings including JSON-RPC, gRPC, and REST. Over **150 organizations** including Adobe, ServiceNow, and Twilio have joined the A2A ecosystem.

The protocols interconnect as follows: A2A handles agent-to-agent coordination, with A2UI payloads traveling as message content between agents. AG-UI manages the final-mile connection to the user interface, streaming A2UI specifications (among other event types) to the frontend for rendering. Agent Cards in A2A can advertise A2UI capability through extensions, specifying which component catalogs the agent supports.

---

## Frameworks translate protocols into production-ready developer experience

**CopilotKit** has emerged as the dominant React-first framework for agentic interfaces, with **27,800 GitHub stars** and production deployments across enterprise and startup applications. It implements AG-UI natively and added A2UI support through a Google partnership in December 2025. The framework provides pre-built components (`CopilotSidebar`, `CopilotPopup`, `CopilotTextarea`) alongside hooks for custom integrations.

The key CopilotKit patterns demonstrate how generative UI works in practice. `useCopilotReadable` gives agents "eyes" to observe application state. `useCopilotAction` gives agents "hands" to execute actions with custom UI rendering. `useCoAgentStateRender` maps agent state directly to React components. `useRenderToolCall` triggers specific component renders when agents invoke particular tools. The framework handles thread persistence, reconnection, multi-agent coordination, and provides enterprise guardrails for prompt injection and data leak prevention through Copilot Cloud.

**Flutter GenUI SDK**, released by Google in alpha, brings agentic UI to cross-platform mobile development. It uses A2UI internally and introduces the `Catalog` concept—a registry of approved widgets with name, schema, and builder function. The `GenUiConversation` class orchestrates message flow, while `GenUiSurface` widgets rebuild automatically when surfaces update. Content generators support multiple backends: direct Gemini API for prototyping, Firebase AI Logic for production with managed API keys, or A2UI server mode for custom agent backends.

**Vercel AI SDK** pioneered generative UI in the web ecosystem through React Server Components streaming. The `streamUI` function allows tools to yield React components during generation—show a spinner, then partial results, then final component. However, development of AI SDK RSC is currently **paused**, with Vercel recommending AI SDK UI hooks for production deployments. The migration path involves using the `message.parts` array structure where tool calls map to custom components.

**LangGraph** provides agent orchestration with generative UI through the `useStream()` hook, supporting component colocating and shadow DOM isolation. It integrates natively with AG-UI and offers the most sophisticated graph-based workflow execution for complex multi-agent scenarios.

Platform support varies by framework. Web has the most mature ecosystem: React via CopilotKit and Vercel AI SDK, Angular via CopilotKit and A2UI, Lit via A2UI. Mobile lags slightly: Flutter is shipping via GenUI SDK, while SwiftUI and Jetpack Compose renderers for A2UI are on the Q2 2026 roadmap. Desktop sees .NET Blazor support through Microsoft Agent Framework integration with AG-UI, plus Flutter Desktop through the GenUI SDK.

---

## Reference architectures organize agentic applications into coherent layers

Enterprise agentic applications require clear architectural separation. A proven layered model organizes responsibilities from bottom to top: the LLM/model layer (foundation models like GPT, Claude, Gemini), the tool/context layer (MCP protocol connecting agents to external APIs and databases), the specialist agent layer (domain experts and worker agents), the orchestration layer (supervisor agents handling routing and coordination), the AG-UI client layer (event subscription and state sync), and the user interface layer (chat UIs, embedded copilots, dashboards).

Salesforce's enterprise architecture patterns provide templates for orchestration. The **Greeter** pattern determines user intent via NLP and routes to human agents for warm handoff. The **Operator** pattern routes to specialist agents or humans based on negotiated intent. The **Orchestrator** pattern manages an agent "swarm," aggregating responses from multiple specialists for multi-faceted inquiries. The **Workspace** pattern (nicknamed "Radar O'Reilly") manages responsive single-pane-of-glass UIs that adapt based on agent context.

Agent reasoning follows established design patterns. The **Reflection** pattern has agents review their own work for mistakes. The **Tool Use** pattern enables agents to select and invoke external capabilities. **ReAct** combines reasoning and action in iterative cycles. The **Planning** pattern decomposes complex tasks into structured subtasks. Multi-agent collaboration has multiple specialized agents working together, either through supervisor coordination or peer-to-peer communication via A2A.

Memory and state management varies by framework. LangGraph uses graph state as shared memory, supporting short and long-term memory with vector store integration (Pinecone, Weaviate, Chroma). AG-UI provides bi-directional state synchronization through `STATE_SNAPSHOT` and `STATE_DELTA` events. CopilotKit's hooks expose agent state for rendering and allow clients to update it, creating true collaborative state between human and agent.

Client-side best practices for consuming agent-generated UI emphasize safety and robustness. Maintain a vetted component catalog—agents can only request what the client explicitly allows. Implement strict schema validation for all incoming UI definitions. Provide fallback rendering for unknown or malformed components. Log unknown component attempts for monitoring and model improvement. Use progressive enhancement: stream intermediate steps (plans, retrieval results, thinking tokens) rather than waiting for complete responses. Perplexity's step visualization demonstrates that showing progress improves user satisfaction even when total completion time remains unchanged.

Security boundaries follow the "secure like data, expressive like code" principle. A2UI transmits declarative component descriptions, never executable code. Clients render using their own trusted components with their own styling and accessibility behaviors. Enterprise deployments add guardrails at the AG-UI boundary: prompt injection prevention, sensitive data leak blocking, brand compliance enforcement, and comprehensive audit logging.

---

## Multimodal patterns enable hybrid interfaces across text, voice, and visual modalities

Multimodal agentic UI goes beyond chat-plus-buttons to fully integrated experiences where agents generate appropriate interface elements across text, voice, images, and actions based on context. Google's Gemini Dynamic View exemplifies this approach: for any prompt, the model generates complete interactive web applications on-the-fly—calculators, galleries, planners, simulations—with different content and features based on contextual factors like user expertise level.

The GUI-plus-voice cohesion architecture, developed through academic research, uses MVVM patterns where the ViewModel exposes tools via Model Context Protocol. This enables voice accessibility while maintaining visual interface alignment—every action achievable through GUI becomes equally attainable via voice, with immediate synchronized feedback across modalities.

Key use cases demonstrate multimodal patterns in action. Dynamic dashboards see agents generating visualizations based on data context and user questions. Adaptive forms are generated based on uploaded content—a landscaping app analyzes a yard photo, then generates custom sliders and date pickers for project preferences. Multi-step workflows use agents orchestrating complex processes with appropriate UI at each stage. Collaborative canvases enable AI participation in design or analysis tasks with interactive tools and simulations.

Trade-offs in agentic UX require explicit design decisions. **Latency versus streaming** asks whether to wait for complete responses or stream partial results—streaming wins for perceived responsiveness, with up to **80% reduction in perceived latency** when showing generation progress. **Controllability versus autonomy** maps to trust levels: auto mode (complete delegation), can-I-play-with mode (watching while agent works), manual mode (human handles directly). **Predictability versus personalization** weighs consistent behavior against context adaptation—current solutions emphasize transparency about what's happening and why, plus override affordances.

Microsoft's agent UX design principles offer concrete guidance. Agents should be "easily accessible yet occasionally invisible"—operating in background with relevant nudges, supporting seamless foreground-to-background transitions. They should "embrace uncertainty, establish trust" by showing confidence levels and reasoning rather than projecting false certainty. Transparency requires visible background processes via dashboards, human control switches, and familiar UI elements that maintain consistency with existing interaction patterns.

Reversible actions and undo capabilities become critical in agentic contexts. Users need affordances to intervene and override agent decisions, pause or halt behaviors, adjust parameters mid-task, and review action history. These controls should be accessible but unobtrusive, serving both novice users who need safety rails and power users who need efficiency.

---

## The ecosystem spans protocols, frameworks, and commercial products in rapid evolution

The agentic UI ecosystem has matured significantly through 2025, with major technology companies heavily invested. Google has shipped Gemini Dynamic View (consumer), A2UI protocol (infrastructure), GenUI SDK for Flutter (developer tools), and uses A2UI internally for Opal, an AI mini-apps product serving hundreds of thousands of users. OpenAI launched AgentKit at DevDay 2025, comprising Agent Builder (visual workflow canvas), ChatKit (embeddable chat UI), and Apps SDK for interactive UIs inside ChatGPT. Microsoft integrated AG-UI into their Agent Framework with ASP.NET Core support.

Commercial products implementing agentic UI patterns include Vercel's v0 (text-to-UI generation), Lovable (full-stack apps from prompts, valued at **$6.6 billion**), and HubSpot's Breeze customer support agent built on OpenAI AgentKit. The market signals strong demand: Lovable's valuation tripled in five months, Google acquired Galileo AI and rebranded it as Google Stitch, and four million developers now use OpenAI's API (doubled from 2023).

Open source repositories anchor the developer ecosystem. CopilotKit leads with comprehensive React support. The ag-ui-protocol/ag-ui repository provides TypeScript and Python SDKs. Google's A2UI repository includes web and Flutter renderers. Starter templates accelerate adoption: with-adk for CopilotKit plus Google ADK, with-a2a-a2ui for the full protocol stack, and minimal-copilotkit-langgraph for streamlined setups.

Case studies reveal production patterns. **Gemini Dynamic View** generates HTML/CSS/JS from scratch for each prompt using Gemini 3 with tool access (image generation, web search), carefully crafted system instructions, and post-processing to fix formatting inconsistencies. **CopilotKit production stacks** use `useRenderToolCall` to map agent tool calls to React components, with tool results streaming from backends and triggering component renders. **Flutter GenUI SDK deployments** use `GenUiConversation` for orchestration, `Catalog` for widget approval, and `DataModel` for reactive state that auto-rebuilds widgets on changes.

---

## Design principles for agentic experiences require new mental models

Designing for agentic UI requires shifting from interface-centric to intent-centric thinking. Start with user goals, not screens. Prototype agent behavior before making UI decisions. The interface becomes emergent property of agent capability rather than predetermined artifact.

Task decomposition in the interface means surfacing agent plans, tool calls, and intermediate state rather than hiding complexity. The "glass-box approach" captures agent goals, reasoning steps, state transitions, and tool invocations at trace level. Feature attribution shows how inputs contribute to outputs. Confidence scoring helps users calibrate trust. Action history provides audit trails for accountability.

The designer's role evolves but doesn't disappear. As generative systems mature, design work shifts upstream from drawing artifacts to defining rules of composition. **Intent modeling** specifies user goals and how systems infer them from signals. **Context modeling** determines which signals matter and how they shape hierarchy and navigation. **Policy and guardrails** codify brand and usability standards into machine-checkable rules.

Design systems adapt by distinguishing invariants from flex allowances. Invariants—visual identity, legibility thresholds, motion discipline, interaction contracts—must not change. Flex allowances—density, layout, disclosure, control placement—can adapt per context. The AI composition engine operates within these boundaries, generating compliant interfaces dynamically.

Agent personality design emerges as a new discipline. Agents shouldn't mimic humans but should exhibit context-appropriate behavior. Tone, verbosity, proactiveness, and intervention thresholds become design parameters. The framing matters: "partnership" rather than "automation" sets appropriate user expectations.

---

## Future trajectories point toward standardization and deeper multimodal integration

The protocol stack is converging. A2UI handles declarative UI specification (what gets rendered). AG-UI manages runtime connection (agent-to-UI bridge). A2A coordinates agent-to-agent communication. MCP provides agent-to-tool context. Two approaches compete for UI delivery: Google's native-first approach via A2UI (declarative component descriptions, client renders natively) versus the web-centric approach via MCP Apps (mini web apps in sandboxed iframes). The native-first approach offers better performance and design system integration; the web-centric approach offers faster iteration and broader compatibility.

Expected developments for 2026-2027 include full A2UI support shipping across all AG-UI clients, cross-platform renderers reaching production stability (SwiftUI and Jetpack Compose in Q2 2026), enhanced streaming and incremental update support, and dynamic UX negotiation within tasks where agents add audio or video mid-conversation. Multi-agent mesh coordination across organizations will become practical through A2A standardization.

Open research problems require attention. **Evaluation metrics** for agentic UI quality remain nascent—current approaches measure task success rate, output correctness, latency, and safety scores, but lack comprehensive frameworks for interface quality specifically. **Debugging AI-generated interfaces** faces the "observability gap" between output and internal reasoning—emerging solutions include full chain-of-thought traceability, attention visualization, and LLM-as-judge evaluations. **Safety and governance** must address role-based access control for agent actions, agent versioning and audit trails, and cross-agent trust boundaries in multi-agent deployments. Regulatory frameworks (NIST AI RMF, EU AI Act) will increasingly require traceability and algorithmic transparency.

---

## Conclusion: Building for the agentic future

The agentic UI stack has crossed the threshold from experimental to production-ready. Three protocols (A2UI, AG-UI, A2A) provide interoperable foundations. Mature frameworks (CopilotKit, Flutter GenUI, Vercel AI SDK) offer developer-friendly abstractions. Major platforms (Google, OpenAI, Microsoft) are shipping products that generate interfaces dynamically.

The key architectural insight is separation of concerns: agents describe intent (what UI should appear), protocols transport that intent (how messages flow), and clients render using trusted local components (how intent becomes pixels). This separation enables security without sacrificing expressiveness, and cross-platform delivery without per-platform agent tuning.

For product and UX teams evaluating this technology, the actionable path forward involves three phases. First, instrument existing applications with state observability hooks (`useCopilotReadable` patterns) so agents can understand context. Second, introduce tool-based generative UI for specific high-value features—forms, dashboards, workflows that benefit from dynamic composition. Third, evolve toward declarative A2UI adoption for full agentic capability as the protocol ecosystem stabilizes.

The designer's role transforms but remains essential. Someone must define the component catalogs agents draw from, the invariants that maintain brand consistency, the trust signals that calibrate user expectations, and the override affordances that keep humans in control. Agentic UI doesn't automate design—it elevates it from artifact production to systems architecture.

What makes this moment distinctive is not that AI can generate interfaces, but that we now have the protocols and frameworks to do so safely, at scale, across platforms. The next two years will determine whether this stack consolidates into infrastructure as foundational as REST APIs, or fragments into competing proprietary approaches. The current trajectory—open protocols, cross-vendor adoption, Linux Foundation governance—suggests the former. Teams building agentic applications today are positioning themselves at the leading edge of how software will be built and experienced.