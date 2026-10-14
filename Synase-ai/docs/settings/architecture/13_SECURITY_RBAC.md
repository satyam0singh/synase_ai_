# Security & RBAC

## Roles
`owner` > `admin` > `developer` > `member` > `viewer`

Role is not the only authorization dimension. Effective access = role permissions + scope + policy + resource ownership + entitlement.

## Sensitive actions
Require elevated permission and, where appropriate, recent authentication:
- create/revoke API keys
- modify workspace security policy
- disconnect/revoke connectors
- delete data
- change autonomous execution policy
- modify member roles
- modify secret/credential references

## Secret rules
- Encrypt retrievable third-party credentials using a managed secret store or envelope encryption.
- Hash one-time API key secrets if they never need to be recovered.
- Never return secrets from list endpoints.
- Never log secrets.
- Never place secrets in query parameters.
- Never persist plaintext secrets in localStorage.

## Policy evaluation
Client-side state may improve UX but cannot authorize an action. Every server mutation re-evaluates authorization.

## Audit
Security-sensitive actions generate append-only audit records with actor, resource, action, result and request ID.
