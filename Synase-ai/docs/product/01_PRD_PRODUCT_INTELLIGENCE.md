# PRD — Synase AI Product Intelligence Layer

**Document status:** Baseline for implementation
**Source basis:** Synase AI project handoff; Drive-specific reconciliation pending
**Product:** SYNASE AI
**Layer:** Product Intelligence
**Version target:** Product Layer Revamp v1

## 1. Product objective

Turn repository-derived and multimodal product evidence into a structured decision surface that helps a software team answer four questions:

1. What should we build?
2. What matters most?
3. Why are we building it?
4. In what sequence should it ship?

The layer must preserve the distinction between observed/confirmed facts and generated suggestions, and must make decisions traceable back to evidence.

## 2. Problem statement

Software teams often have requirements, issues, product ideas, architecture signals and project constraints distributed across code, documents and conversations. Without a dedicated product intelligence surface, teams must manually synthesize those inputs into requirements, priorities, strategy and roadmap decisions.

Synase should provide a single project-scoped product decision surface that turns these inputs into structured, reviewable artifacts.

## 3. Users

### Primary — Product/Project Lead
Needs a trustworthy view of requirements, priorities, product strategy and roadmap sequencing.

### Secondary — Engineering Lead
Needs to understand product decisions, rationale, dependencies and architecture implications without leaving the project context.

### Secondary — Stakeholder/Reviewer
Needs concise decision evidence, provenance and approval state.

## 4. Jobs to be done

- Inspect all known product requirements.
- Separate confirmed facts from AI-suggested candidates.
- Compare candidate features using value, impact, effort and risk.
- Understand the current product objective and principles.
- Sequence product work into a roadmap.
- Trace roadmap items back to features/requirements/evidence.
- Review proposed decisions before they become confirmed state.
- Generate decision-ready outputs without pretending execution occurred.

## 5. Product scope

### In scope

**Requirements**
- Requirement inventory
- Requirement metadata
- Type, priority and lifecycle state
- Evidence and rationale
- Architecture impact
- Provenance and confidence
- Requirement detail view

**Prioritization**
- Feature/candidate inventory
- Value / impact / effort / risk dimensions
- Rank and status
- Rationale
- Comparison and sorting
- Provenance

**Strategy**
- Product objective
- Product principles
- Known risks/constraints
- Strategy provenance
- Strategy revision history at the UI/API contract level

**Roadmap**
- Milestones/releases
- Sequence
- Dates
- Dependencies
- Status
- Feature/requirement linkage
- Roadmap detail surface

**Cross-cutting**
- Project scoping
- Provenance display
- Mock-mode disclosure
- Loading/empty/error states
- Decision/approval handoff
- Accessibility and keyboard support
- Light/dark theme compatibility

## 6. Out of scope for current mock implementation

- Live LLM inference
- Live MCP tool execution
- External product-management integrations
- Automatic deployment
- Autonomous execution of product changes
- Silent mutation of confirmed state

## 7. Target information architecture

`Product Intelligence`

- Overview
- Requirements
- Prioritization
- Strategy
- Roadmap
- Decisions / change history (target)

The existing application exposes a single tabbed Product Intelligence page. The revamp should allow section-level routes if the Drive source calls for deeper workflows, while preserving the single-router architecture.

## 8. Functional requirements

### FR-01 Project context
Every Product Intelligence operation is project-scoped.

### FR-02 Requirements
The UI shall display requirements with identifiers, titles, type, priority, status, rationale, evidence, architecture impact and provenance.

### FR-03 Requirement detail
Selecting a requirement shall expose its evidence, rationale, provenance, lifecycle state and linked product decisions.

### FR-04 Prioritization
The UI shall display candidate product features using value, impact, effort and risk signals and a deterministic priority rank.

### FR-05 Strategy
The UI shall display the active objective, principles and known risks.

### FR-06 Roadmap
The UI shall display roadmap items in sequence with release/milestone, dates, dependencies and lifecycle status.

### FR-07 Provenance
Every generated candidate or recommendation shall visually identify itself as `ai_suggested`; confirmed project state shall remain `confirmed`.

### FR-08 Mock disclosure
The Product layer shall clearly communicate that the current workflow is mocked and that no AI/tool/pipeline execution is occurring.

### FR-09 Safe mutation
Any mutation shall require an idempotency key and shall return a deterministic receipt in mock mode.

### FR-10 Error contract
API failures shall surface a structured `ApiError` contract with code, message, status, requestId and details.

### FR-11 Empty state
Each Product section shall distinguish between genuinely empty project state and an unavailable/error state.

### FR-12 Cross-layer isolation
Product code shall not import DevOps, MCP, Context, Work or other domains.

## 9. Non-functional requirements

- Zero raw colors in product styles; use semantic design tokens.
- Square/minimal corner radius consistent with the existing console visual language.
- All user-controlled/interpolated content escaped with the shared `escapeHtml` helper.
- Views contain no event listeners and no direct API calls.
- Keyboard-accessible controls and semantic HTML.
- Deterministic mock fixtures.
- Contract tests for every facade method.

## 10. Success criteria

A Product Lead should be able to enter a project and, without external tools:

- understand the current product state in under 60 seconds;
- inspect the highest-priority product candidates;
- explain the active strategy;
- understand near-term roadmap sequencing and dependencies;
- identify which information is confirmed versus suggested;
- trace a decision to supporting evidence.

## 11. Drive Reconciliation Required

Before calling this PRD final, merge the Google Doc's exact:

- product terminology;
- user personas and workflows;
- required fields and statuses;
- acceptance criteria;
- scoring formula(s);
- screen hierarchy;
- decision/approval rules;
- integrations and future-state execution boundaries;
- reporting expectations;
- KPI definitions.
