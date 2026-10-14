import test from "node:test";
import assert from "node:assert/strict";
import { authPage } from "../src/app/auth.js";
import { mockApi } from "../src/shared/api/mock.js";

test("authPage renders Auth 4 split layout with Orbital Trust Ring and login form", () => {
  const html = authPage("login");
  assert.ok(html.includes('class="auth-layout"'));
  assert.ok(html.includes('class="auth-orbital-container"'));
  assert.ok(html.includes('class="orbital-stage"'));
  assert.ok(html.includes('SOC 2 Type II'));
  assert.ok(html.includes('99.99% SLA'));
  assert.ok(html.includes('Zero Retention'));
  assert.ok(html.includes('auth-how-grid'));
  assert.ok(html.includes('auth-capability-card'));
  assert.ok(html.includes('auth-sso-group'));
  assert.ok(html.includes('data-toggle-password="auth-password"'));
  assert.ok(html.includes('data-action="demo-login"'));
  assert.ok(html.includes('Welcome back'));
});

test("authPage renders register view with name field and registration title", () => {
  const html = authPage("register");
  assert.ok(html.includes('id="auth-name"'));
  assert.ok(html.includes('Create your account'));
  assert.ok(html.includes('auth-tab-btn active'));
});

test("authPage renders forgot password recovery view", () => {
  const html = authPage("forgot");
  assert.ok(html.includes('Recover access'));
  assert.ok(html.includes('id="auth-email"'));
  // Password field is omitted in recovery view
  assert.ok(!html.includes('id="auth-password"'));
});

test("mockApi authentication endpoints enforce validation and canonical envelope", async () => {
  // Empty credentials fail with validation error
  await assert.rejects(
    () => mockApi.login({ email: "", password: "" }),
    { name: "ApiError", code: "VALIDATION_ERROR" }
  );

  // Valid credentials return authenticated payload
  const res = await mockApi.login({ email: "alex.turner@company.com", password: "password123" });
  assert.equal(res.data.authenticated, true);
  assert.ok(res.data.user);

  // Recovery accepts email
  const recRes = await mockApi.recover("alex@company.com");
  assert.equal(recRes.data.accepted, true);
});
