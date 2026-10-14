# Non-negotiable Invariants

1. No secret in telemetry/logs.
2. No client-side authorization as the final security boundary.
3. No lower-scope override of higher-scope deny.
4. No one-time secret returned after creation.
5. External side effects require policy evaluation.
6. Security-sensitive mutations are audited.
