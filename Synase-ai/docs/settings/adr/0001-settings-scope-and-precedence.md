# ADR-0001 — Settings Scope and Precedence

## Decision
SYNASE Settings uses explicit scopes: user, workspace, project, agent, task, session. Policy restrictions are monotonic: a lower scope cannot override a higher-scope deny.

## Why
AI configuration becomes unsafe and unpredictable when scope is implicit. Explicit precedence makes effective behavior explainable and testable.

## Consequences
Requires a resolver service and provenance metadata. More schema work is required, but runtime behavior is deterministic.
