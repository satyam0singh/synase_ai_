# ADR-0002 — Secret Handling

## Decision
Secrets are represented in configuration by credential references. One-time API key secrets are returned only during creation. Connector credentials are stored outside ordinary settings values.

## Why
Settings objects are frequently logged, cached, serialized and returned to clients. Secret references reduce accidental exposure.

## Consequences
Credential lifecycle requires a dedicated service and rotation/revocation behavior.
