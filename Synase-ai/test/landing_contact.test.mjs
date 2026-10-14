import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidEmail,
  validateContactForm,
  DEFAULT_CONTACT_EMAIL,
  initContactForm
} from "../src/home/landing/contactForm.js";

test("isValidEmail rejects malformed emails and accepts valid RFC-like formats", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("plainaddress"), false);
  assert.equal(isValidEmail("@missingusername.com"), false);
  assert.equal(isValidEmail("username@.com"), false);
  assert.equal(isValidEmail("username@domain"), false);
  assert.equal(isValidEmail("user@domain.com"), true);
  assert.equal(isValidEmail("alex.turner@enterprise.acme.co"), true);
  assert.equal(isValidEmail(" dev.lead+synase@sub.domain.org "), true);
});

test("validateContactForm validates required name, email, inquiry_type, subject, and message", () => {
  // Empty data
  const emptyRes = validateContactForm({});
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.name);
  assert.ok(emptyRes.errors.email);
  assert.ok(emptyRes.errors.inquiry_type);
  assert.ok(emptyRes.errors.subject);
  assert.ok(emptyRes.errors.message);

  // Short name and short message
  const shortRes = validateContactForm({
    name: "A",
    email: "test@example.com",
    inquiry_type: "Product Information",
    subject: "Eval",
    message: "Too short"
  });
  assert.equal(shortRes.valid, false);
  assert.ok(shortRes.errors.name);
  assert.ok(shortRes.errors.message);

  // Message over 3000 characters
  const tooLongRes = validateContactForm({
    name: "Alex Turner",
    email: "alex@example.com",
    inquiry_type: "Technical Support",
    subject: "Kubernetes integration query",
    message: "x".repeat(3001)
  });
  assert.equal(tooLongRes.valid, false);
  assert.ok(tooLongRes.errors.message);

  // Complete valid payload
  const validRes = validateContactForm({
    name: "Alex Turner",
    email: "alex@enterprise.com",
    organization: "Acme Cloud",
    inquiry_type: "Product Information",
    subject: "Evaluating SYNASE AI for microservices telemetry",
    message: "We are looking to connect our GitHub repositories and review PRDs with SYNASE AI."
  });
  assert.equal(validRes.valid, true);
  assert.deepEqual(validRes.errors, {});
});

test("DEFAULT_CONTACT_EMAIL is configured for enterprise fallback", () => {
  assert.equal(DEFAULT_CONTACT_EMAIL, "satyam8076singh@gmail.com");
});

test("initContactForm setTopic selects matching option and resolves aliases", () => {
  const options = [
    { value: "", text: "Select an inquiry category…" },
    { value: "Product Evaluation & Demo", text: "Product Evaluation & Demo" },
    { value: "Research & Academic Collaboration", text: "Research & Academic Collaboration" },
    { value: "Technical Support", text: "Technical Support" },
    { value: "General Inquiries", text: "General Inquiries" },
    { value: "Other", text: "Other Specialized Request" }
  ];

  let selectedIndex = 0;
  const mockSelect = {
    name: "inquiry_type",
    options,
    get selectedIndex() { return selectedIndex; },
    set selectedIndex(idx) { selectedIndex = idx; },
    get value() { return options[selectedIndex]?.value || ""; },
    removeAttribute: () => {},
    dispatchEvent: () => true
  };

  const mockForm = {
    getAttribute: () => "https://formsubmit.co/satyam8076singh@gmail.com",
    querySelector: (selector) => {
      if (selector === '[name="inquiry_type"]') return mockSelect;
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const { setTopic, getTopic } = initContactForm(mockForm);

  // Exact match
  setTopic("Product Evaluation & Demo");
  assert.equal(getTopic(), "Product Evaluation & Demo");
  assert.equal(mockSelect.selectedIndex, 1);

  // Technical Support
  setTopic("Technical Support");
  assert.equal(getTopic(), "Technical Support");
  assert.equal(mockSelect.selectedIndex, 3);

  // General Inquiries
  setTopic("General Inquiries");
  assert.equal(getTopic(), "General Inquiries");
  assert.equal(mockSelect.selectedIndex, 4);

  // Alias: "Product Information" -> "Product Evaluation & Demo"
  setTopic("Product Information");
  assert.equal(getTopic(), "Product Evaluation & Demo");
  assert.equal(mockSelect.selectedIndex, 1);

  // Alias: "Partnership & Research" -> "Research & Academic Collaboration"
  setTopic("Partnership & Research");
  assert.equal(getTopic(), "Research & Academic Collaboration");
  assert.equal(mockSelect.selectedIndex, 2);
});
