// @ts-check
/* Chat & Work controller.

   Owns the surface's data loading and every work-* action. render() and
   toast() are injected once at boot rather than imported, because they close
   over the router and the shell: importing them here would make app/main.js
   and this module mutually dependent. */

import { state } from "../../shared/state/store.js";
import { createIdempotencyKey } from "../../shared/api/index.js";
import { workspaceApi } from "../../home/workspace/api/index.js";
import { workApi } from "../../work/api/index.js";
import { STARTERS } from "../../work/constants.js";

/**
 * @param {{render: () => void, toast: (message: string) => void}} context
 */
export function createWorkController({ render, toast }) {
  /**
   * Handles one work-* action. Returns true when it consumed the action.
   * @param {string} action
   * @param {Element} target
   * @returns {boolean}
   */
  function handleWorkAction(action, target) {
    /* Each chip owns its own popover: + is Agent Mode, and layer and effort
       have their own. A session already scoped to Product or DevOps cannot
       re-pick its layer from the Agent Mode menu. */
    if (action === "work-open-menu") {
      const kind = target.getAttribute("data-menu") || "agent";
      state.workMenu = state.workMenu === kind ? "" : kind;
      render();
      if (kind === "agent") focusWorkInput();
      return true;
    }
    if (action === "work-layer") {
      updateWorkScope({
        workMenu: "",
        workMode: "work",
        workLayer: target.getAttribute("data-layer") || ""
      });
      return true;
    }
    if (action === "work-capability") {
      updateWorkScope({
        workMenu: "",
        workMode: "work",
        workCapability: target.getAttribute("data-capability") || ""
      });
      return true;
    }
    if (action === "work-effort") {
      updateWorkScope({ workMenu: "", workEffort: target.getAttribute("data-effort") || "auto" });
      return true;
    }
    if (action === "work-trigger-file-upload") {
      state.workMenu = "";
      render();
      const fileInput = /** @type {HTMLInputElement | null} */ (document.querySelector("#work-file-input"));
      if (fileInput) fileInput.click();
      return true;
    }
    if (action === "work-attach-repository") {
      state.workMenu = "";
      let repoName = "synase-ai/intelligence-core";
      try {
        const input = typeof window !== "undefined" && window.prompt ? window.prompt("Enter GitHub repository to attach (e.g. synase-ai/intelligence-core):", repoName) : null;
        if (input && input.trim()) repoName = input.trim();
      } catch (_) {}
      state.workAttachments = [
        ...(state.workAttachments || []),
        { id: `att_${Date.now()}`, type: "github", name: repoName, size: "main branch · live tree" }
      ];
      toast(`Attached repository context: ${repoName}`);
      render();
      return true;
    }
    if (action === "work-attach-url") {
      state.workMenu = "";
      let url = "https://docs.synase.ai/spec/overview";
      try {
        const input = typeof window !== "undefined" && window.prompt ? window.prompt("Enter Web URL or Documentation link to attach:", url) : null;
        if (input && input.trim()) url = input.trim();
      } catch (_) {}
      state.workAttachments = [
        ...(state.workAttachments || []),
        { id: `att_${Date.now()}`, type: "url", name: url, size: "live documentation" }
      ];
      toast(`Attached web URL context: ${url}`);
      render();
      return true;
    }
    if (action === "work-attach-tracker") {
      state.workMenu = "";
      let issueKey = "SYN-204 · Intelligent Routing Pipeline";
      try {
        const input = typeof window !== "undefined" && window.prompt ? window.prompt("Enter Jira or Linear Issue key to attach:", issueKey) : null;
        if (input && input.trim()) issueKey = input.trim();
      } catch (_) {}
      state.workAttachments = [
        ...(state.workAttachments || []),
        { id: `att_${Date.now()}`, type: "tracker", name: issueKey, size: "active sprint item" }
      ];
      toast(`Attached issue tracking context: ${issueKey}`);
      render();
      return true;
    }
    if (action === "work-remove-attachment") {
      const idx = Number(target.getAttribute("data-index"));
      if (!isNaN(idx) && state.workAttachments) {
        state.workAttachments.splice(idx, 1);
        state.workAttachments = [...state.workAttachments];
        render();
      }
      return true;
    }
    if (action === "work-clear") {
      /* only the capability chip is clearable; the layer chip opens its menu */
      updateWorkScope({
        workCapability: "",
        workMode: state.workLayer ? "work" : "chat"
      });
      return true;
    }
if (action === "work-tab") {
  updateWorkScope({ workMenu: "", workMode: target.getAttribute("data-mode") === "work" ? "work" : "chat" });
  return true;
}
if (action === "work-thinking") {
  state.workThinking = !state.workThinking;
  toast(state.workThinking ? "Extended reasoning draft is a UI flag only in the mock." : "Standard draft.");
  render();
    focusWorkInput();
    return true;
  }
  if (action === "work-mic") {
  const SpeechRecognition =
    // @ts-ignore
    window.SpeechRecognition ||
    // @ts-ignore
    window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast("Web Speech recognition is not supported in this browser.");
    return true;
  }
  // @ts-ignore
  if (state.isRecordingVoice && window.__synaseSpeechRec) {
    // @ts-ignore
    window.__synaseSpeechRec.stop();
    state.isRecordingVoice = false;
    render();
    toast("Voice input stopped.");
    return true;
  }
  try {
    const recognition = new SpeechRecognition();
    // @ts-ignore
    window.__synaseSpeechRec = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      state.isRecordingVoice = true;
      render();
      toast("Listening... Speak your prompt.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        state.workComposer = (state.workComposer ? `${state.workComposer} ` : "") + transcript;
        const input = /** @type {HTMLInputElement | null} */ (document.querySelector("#work-input"));
        if (input) input.value = state.workComposer;
        render();
        toast(`Captured: "${transcript}"`);
      }
    };
    recognition.onerror = (event) => {
      state.isRecordingVoice = false;
      render();
      toast(`Voice input: ${event.error || "error"}`);
    };
    recognition.onend = () => {
      state.isRecordingVoice = false;
      render();
      focusWorkInput();
    };
    recognition.start();
  } catch (err) {
    state.isRecordingVoice = false;
    render();
    toast("Microphone initialization failed.");
  }
  return true;
}
if (action === "work-starter") {
  const starter = STARTERS.find((item) => item.id === target.getAttribute("data-starter"));
  if (starter) {
    state.workComposer = starter.action;
    const input = /** @type {HTMLInputElement | null} */ (document.querySelector("#work-input"));
    if (input) input.value = starter.action;
    render();
    sendWorkMessage();
  }
  return true;
}
if (action === "work-new") {
  workApi
    .createWorkSession(
      state.projectId,
      { title: "New work session", mode: state.workMode, layer: state.workLayer, capability: state.workCapability, effort: state.workEffort },
      { idempotencyKey: createIdempotencyKey() }
    )
    .then((result) => {
      state.workArtifactId = "";
      loadWork(result.data.id).then(() => focusWorkInput());
    })
    .catch((error) => toast(error instanceof Error ? error.message : "Unable to start a session."));
  return true;
}
if (action === "work-open-artifact") {
    state.workArtifactId = target.getAttribute("data-artifact") || "";
    state.workArtifactsOpen = true;
    render();
    return true;
  }
  if (action === "work-close-artifacts") {
    /* collapse only; the selection is kept so reopening restores it */
    state.workArtifactsOpen = false;
    render();
    return true;
  }
  if (action === "work-toggle-artifacts") {
    state.workArtifactsOpen = !state.workArtifactsOpen;
    render();
    return true;
  }
if (action === "work-connect-github") {
  workApi
    .connectWorkRepository(state.projectId, {}, { idempotencyKey: createIdempotencyKey() })
    .then(async (result) => {
      state.workRepository = result.data.repository;
      state.repositories = (await workspaceApi.listRepositories(state.projectId)).data;
      toast("Repository added as pending in the mock. Nothing was imported or contacted.");
      render();
    })
    .catch((error) => toast(error instanceof Error ? error.message : "Unable to connect the repository."));
  return true;
}
    return false;
  }
const WORK_SESSION_IDLE = "wrk_research";

/**
 * Loads the session list plus the requested session's messages and artifacts.
 * Called on route entry and after every mutation, so the thread and the
 * artifact panel never drift apart.
 */
  async function loadWork(sessionId = state.workSessionId) {
  try {
    state.workSessions = (await workApi.listWorkSessions(state.projectId)).data;
  } catch (error) {
    toast(error instanceof Error ? error.message : "Unable to load work sessions.");
    return true;
  }

  const wanted =
    sessionId ||
    state.workSessionId ||
    state.workSessions[0]?.id ||
    WORK_SESSION_IDLE;
  const session = state.workSessions.find((item) => item.id === wanted);

  state.workSessionId = session ? session.id : "";
  if (session) {
    state.workMode = session.mode || "chat";
    state.workLayer = session.layer || "";
    state.workCapability = session.capability || "";
    state.workEffort = session.effort || "auto";
  }

  if (!state.workSessionId) {
    state.workMessages = [];
    state.workArtifacts = [];
    render();
    return true;
  }

  try {
    const [messages, artifacts] = await Promise.all([
      workApi.listWorkMessages(state.projectId, state.workSessionId),
      workApi.listWorkArtifacts(state.projectId, state.workSessionId)
    ]);
    state.workMessages = messages.data;
    state.workArtifacts = artifacts.data;
    state.workArtifactId = state.workArtifactId || state.workArtifacts[state.workArtifacts.length - 1]?.id || "";
    state.workArtifactsOpen = state.workArtifacts.length > 0;
  } catch (error) {
    toast(error instanceof Error ? error.message : "Unable to load the session.");
  }

  state.workRepository =
    state.repositories.find(
      (repo) => repo.projectId === state.projectId && repo.providerName === "github"
    ) || null;

  render();
  scrollWorkThread();
}

/** Keeps the newest message in view without stealing focus. */
  function scrollWorkThread() {
  queueMicrotask(() => {
    const thread = document.querySelector("#work-thread");
    if (thread) thread.scrollTop = thread.scrollHeight;
  });
}

/** Restores composer focus and caret after a re-render. */
  function focusWorkInput() {
  queueMicrotask(() => {
    const input = document.querySelector("#work-input");
    if (input && document.activeElement !== input) {
      input.focus();
      const caret = input.value.length;
      input.setSelectionRange(caret, caret);
    }
  });
}

/**
 * Sends the composer text, then runs the deterministic assistant reply.
 */
  async function sendWorkMessage() {
    const inputEl = /** @type {HTMLInputElement | null} */ (document.querySelector("#work-input"));
    const text = String(inputEl?.value || state.workComposer || "").trim();
    if (!text) return;

    if (!state.workSessionId) {
      try {
        const sessionTitle = text.length > 38 ? text.slice(0, 35) + "..." : text;
        const newSessionRes = await workApi.createWorkSession(
          state.projectId,
          {
            title: sessionTitle,
            mode: state.workMode || "chat",
            layer: state.workLayer || "",
            capability: state.workCapability || "",
            effort: state.workEffort || "auto"
          },
          { idempotencyKey: createIdempotencyKey() }
        );
        state.workSessionId = newSessionRes.data.id;
        state.workSessions = (await workApi.listWorkSessions(state.projectId)).data;
      } catch (err) {
        toast(err instanceof Error ? err.message : "Unable to initialize work session.");
        return;
      }
    }

    let fullText = text;
    if (state.workAttachments && state.workAttachments.length > 0) {
      const sourceSummary = state.workAttachments.map((a) => `[Source: ${a.name} (${a.size || a.type})]`).join("\n");
      fullText = `${text}\n\nAttached Sources:\n${sourceSummary}`;
      state.workAttachments = [];
    }

    state.workComposer = "";
    if (inputEl) inputEl.value = "";
    render();

  try {
    await workApi.postWorkMessage(
      state.projectId,
      state.workSessionId,
      { text: fullText },
      { idempotencyKey: createIdempotencyKey() }
    );
    const result = await workApi.runWorkAssistant(
      state.projectId,
      state.workSessionId,
      {
        prompt: fullText,
        layer: state.workLayer,
        capability: state.workCapability,
        effort: state.workEffort
      },
      { idempotencyKey: createIdempotencyKey() }
    );

    const [messages, artifacts] = await Promise.all([
      workApi.listWorkMessages(state.projectId, state.workSessionId),
      workApi.listWorkArtifacts(state.projectId, state.workSessionId)
    ]);
    state.workMessages = messages.data;
    state.workArtifacts = artifacts.data;
    state.workSessions = (await workApi.listWorkSessions(state.projectId)).data;

    if (result.data.artifact) {
      state.workArtifactId = result.data.artifact.id;
      /* a new artifact is the reason to look at the panel */
      state.workArtifactsOpen = true;
      toast(
        result.data.artifact
          ? "Mock draft produced. Nothing was generated, retrieved, or executed."
          : "Mock reply produced."
      );
    } else {
      toast("Mock reply produced. No artifact in this configuration.");
    }
  } catch (error) {
    toast(error instanceof Error ? error.message : "Unable to send that message.");
  }
  render();
  scrollWorkThread();
}

/** Applies a mode, capability, layer or effort change to the active session. */
  async function updateWorkScope(patch) {
  Object.assign(state, patch);
  render();
  if (!state.workSessionId) return;
  try {
    await workApi.updateWorkSession(
      state.projectId,
      state.workSessionId,
      patch,
      { idempotencyKey: createIdempotencyKey() }
    );
    state.workSessions = (await workApi.listWorkSessions(state.projectId)).data;
    render();
  } catch (error) {
    toast(error instanceof Error ? error.message : "Unable to change the work scope.");
  }
}
  return {
    handleWorkAction,
    loadWork,
    sendWorkMessage,
    focusWorkInput
  };
}
