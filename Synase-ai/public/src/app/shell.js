// @ts-check
/* Application chrome: sidebar, topbar, workspace/project switchers, toast.
   This is the only place that renders navigation, so every route group appears
   in exactly one place. */

import { state } from "../shared/state/store.js";
import { escapeHtml, initials } from "../shared/utils/format.js";
import { brandMarkSvg } from "../shared/components/ui.js";
import { themeToggleMarkup } from "../shared/services/theme.js";
import { routes, projectRoute, isActive } from "./paths.js";
import { lucideIcon } from "../shared/components/icons.js";

/**
 * @param {string} path
 * @param {string} icon
 * @param {string} label
 * @param {boolean} [prefix]
 * @param {boolean} [disabled]
 * @returns {string}
 */
export function navLink(path, icon, label, prefix = false, disabled = false) {
  return `<button class="nav-link ${isActive(path, prefix) ? "active" : ""}" data-route="${disabled ? "" : path}" ${disabled ? 'aria-disabled="true" title="Planned for a later phase"' : ""}>
    <span class="nav-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(label)}</span>
  </button>`;
}

/**
 * Computes active, non-dismissed notifications across approvals, findings, and workflows.
 */
function getActiveNotifications() {
  const dismissed = state.dismissedNotificationIds || [];
  const list = [];
  for (const app of state.approvals || []) {
    if (app.status === "pending" && !dismissed.includes(app.id)) {
      list.push({
        id: app.id,
        category: "Approval Gate",
        title: app.title || `Approval ${app.id}`,
        desc: `Decision required: ${app.impactSummary || "Deployment/architecture sign-off pending."}`,
        route: "/app/approvals",
        tone: "warning",
        time: app.createdAt ? new Date(app.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"
      });
    }
  }
  for (const finding of state.findings || []) {
    if ((finding.severity === "critical" || finding.severity === "high") && !dismissed.includes(finding.id)) {
      list.push({
        id: finding.id,
        category: "Security Finding",
        title: `${finding.severity.toUpperCase()}: ${finding.title}`,
        desc: finding.description || "Identified security vulnerability requiring remediation.",
        route: "/app/intelligence/devops",
        tone: finding.severity === "critical" ? "danger" : "warning",
        time: "Active"
      });
    }
  }
  for (const wf of state.workflows || []) {
    if (wf.status === "running" && !dismissed.includes(wf.id)) {
      list.push({
        id: wf.id,
        category: "Execution Run",
        title: `Workflow ${wf.id} in progress`,
        desc: `${wf.name || "Execution run"} is actively executing tasks.`,
        route: `/app/projects/${state.projectId}/runs`,
        tone: "info",
        time: "Live"
      });
    }
  }
  return list;
}

function renderCommandPalette() {
  if (!state.searchOpen) return "";
  const query = (state.searchQuery || "").trim().toLowerCase();

  const commands = [
    { cat: "Navigation", label: "Chat Intelligence", icon: lucideIcon("bot", { size: 15 }), route: routes.chat, desc: "Autonomous AI conversation canvas" },
    { cat: "Navigation", label: "Work Overview", icon: lucideIcon("layout-dashboard", { size: 15 }), route: routes.work, desc: "Execution runs, starters, and tasks" },
    { cat: "Navigation", label: "Projects Inventory", icon: lucideIcon("folder-kanban", { size: 15 }), route: routes.projects, desc: "Manage projects and decision scopes" },
    { cat: "Navigation", label: "Repository Context", icon: lucideIcon("git-branch", { size: 15 }), route: `/app/projects/${state.projectId}/repository`, desc: "Connect GitHub/GitLab repositories" },
    { cat: "Navigation", label: "Inputs & Artifacts", icon: lucideIcon("file-up", { size: 15 }), route: `/app/projects/${state.projectId}/inputs`, desc: "Multimodal uploads and documents" },
    { cat: "Navigation", label: "Conversation & Analysis", icon: lucideIcon("messages-square", { size: 15 }), route: `/app/projects/${state.projectId}/analysis`, desc: "Structured analysis requests & thread" },
    { cat: "Navigation", label: "Execution Runs", icon: lucideIcon("play", { size: 15 }), route: `/app/projects/${state.projectId}/runs`, desc: "Live workflow tasks & streaming events" },
    { cat: "Navigation", label: "Members & Permissions", icon: lucideIcon("users", { size: 15 }), route: routes.members, desc: "Workspace roles and access control" },
    { cat: "Intelligence", label: "Product Intelligence", icon: lucideIcon("boxes", { size: 15 }), route: "/app/intelligence/product", desc: "Requirements, feature ranking, roadmap" },
    { cat: "Intelligence", label: "DevOps Intelligence", icon: lucideIcon("activity", { size: 15 }), route: "/app/intelligence/devops", desc: "Security findings, dependency scans, test plans" },
    { cat: "Intelligence", label: "MCP Protocol V2", icon: lucideIcon("network", { size: 15 }), route: "/app/mcp/overview", desc: "Model Context Protocol tools & servers" },
    { cat: "Intelligence", label: "Context & Vector Memory", icon: lucideIcon("database", { size: 15 }), route: "/app/context/overview", desc: "Retrieval history and safe projections" },
    { cat: "Intelligence", label: "Knowledge Graph", icon: lucideIcon("workflow", { size: 15 }), route: "/app/knowledge/graph", desc: "Visual dependency & entity relations" },
    { cat: "Outputs", label: "Decision Reports", icon: lucideIcon("file-text", { size: 15 }), route: "/app/reports", desc: "Structured memos and exportable analysis" },
    { cat: "Outputs", label: "Approvals Gate", icon: lucideIcon("shield-check", { size: 15 }), route: "/app/approvals", desc: "Sign-offs and deployment gates" },
    { cat: "System", label: "Integrations & Connectors", icon: lucideIcon("blocks", { size: 15 }), route: "/app/integrations", desc: "Third-party services & sync" },
    { cat: "System", label: "Activity & Audit Log", icon: lucideIcon("history", { size: 15 }), route: "/app/activity", desc: "Immutable trail of all workspace actions" },
    { cat: "System", label: "Settings Control Plane", icon: lucideIcon("settings", { size: 15 }), route: routes.settings, desc: "16-domain policy & configuration" },
    ...(state.projects || []).map((p) => ({
      cat: "Projects",
      label: p.name,
      icon: lucideIcon("folder-kanban", { size: 15 }),
      route: `/app/projects/${p.id}/overview`,
      desc: p.description || `Project ID: ${p.id}`
    })),
    ...(state.assets || []).map((a) => ({
      cat: "Assets",
      label: a.name,
      icon: lucideIcon("file-text", { size: 15 }),
      route: `/app/projects/${state.projectId}/inputs`,
      desc: `${a.inputType || "file"} · ${a.processingStatus || "ready"}`
    })),
    ...(state.requirements || []).map((r) => ({
      cat: "Requirements",
      label: r.title,
      icon: lucideIcon("check-circle", { size: 15 }),
      route: "/app/intelligence/product",
      desc: `${r.priority} priority · ${r.status}`
    })),
    ...(state.reports || []).map((rep) => ({
      cat: "Reports",
      label: rep.title,
      icon: lucideIcon("file-text", { size: 15 }),
      route: `/app/reports/${rep.id}`,
      desc: `State: ${rep.status}`
    }))
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.cat.toLowerCase().includes(query) ||
          c.desc.toLowerCase().includes(query)
      )
    : commands.slice(0, 10);

  return `<div class="synase-modal-backdrop" data-action="close-modals">
    <div class="command-palette-modal">
      <div class="command-palette-search">
        <span class="command-palette-icon">${lucideIcon("search", { size: 16 })}</span>
        <input
          id="command-search-input"
          type="search"
          placeholder="Search navigation, projects, assets, or requirements..."
          value="${escapeHtml(state.searchQuery || "")}"
          autocomplete="off"
          autofocus
        />
        <kbd class="command-palette-kbd">Esc</kbd>
      </div>
      <div class="command-palette-results">
        ${
          filtered.length
            ? filtered
                .map(
                  (item) => `
          <button class="command-palette-item" data-route="${item.route}" data-action="select-command-item">
            <span class="command-item-icon">${item.icon}</span>
            <div class="command-item-text">
              <span class="command-item-title">${escapeHtml(item.label)}</span>
              <span class="command-item-desc">${escapeHtml(item.desc)}</span>
            </div>
            <span class="command-item-badge">${escapeHtml(item.cat)}</span>
          </button>`
                )
                .join("")
            : `<div class="command-palette-empty">No results found for "${escapeHtml(query)}"</div>`
        }
      </div>
      <div class="command-palette-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
        <span><kbd>↵</kbd> to select</span>
        <span><kbd>esc</kbd> to close</span>
      </div>
    </div>
  </div>`;
}

function renderNotificationsDrawer() {
  if (!state.notificationsOpen) return "";
  const notifications = getActiveNotifications();

  return `<div class="synase-modal-backdrop" data-action="close-modals">
    <div class="notifications-drawer">
      <div class="drawer-header">
        <div class="drawer-header-title">
          <h3>Notifications</h3>
          <span class="drawer-badge">${notifications.length} unread</span>
        </div>
        <div class="drawer-header-actions">
          ${notifications.length ? `<button class="button ghost small" id="clear-all-notifications-btn" data-action="clear-all-notifications">Clear all</button>` : ""}
          <button class="icon-btn" id="close-notifications-btn" data-action="close-notifications" aria-label="Close notifications">${lucideIcon("x", { size: 16 })}</button>
        </div>
      </div>
      <div class="drawer-body">
        ${
          notifications.length
            ? notifications
                .map(
                  (n) => `
          <article class="notification-item ${n.tone}">
            <div class="notification-content">
              <div class="notification-meta">
                <span class="notification-cat">${escapeHtml(n.category)}</span>
                <span class="notification-time">${escapeHtml(n.time)}</span>
              </div>
              <h4 class="notification-title">${escapeHtml(n.title)}</h4>
              <p class="notification-desc">${escapeHtml(n.desc)}</p>
              <div class="notification-actions">
                <button class="button small secondary" data-route="${n.route}" data-action="close-notifications">View details</button>
                <button class="button small ghost" data-action="dismiss-notification" data-id="${n.id}">Dismiss</button>
              </div>
            </div>
          </article>`
                )
                .join("")
            : `<div class="notifications-empty">
                 <div class="empty-icon">${lucideIcon("check", { size: 28, strokeWidth: 2.5 })}</div>
                 <h4>All caught up</h4>
                 <p class="subtle">No pending approvals or high-severity security findings.</p>
               </div>`
        }
      </div>
    </div>
  </div>`;
}

function renderProfileModal() {
  if (!state.profileOpen) return "";
  const workspace = state.workspaces.find((w) => w.id === state.workspaceId);
  const project = state.projects.find((p) => p.id === state.projectId);

  return `<div class="synase-modal-backdrop" data-action="close-modals">
    <div class="synase-modal-dialog profile-dialog">
      <div class="modal-header">
        <h3>User Profile & Session</h3>
        <button class="icon-btn" id="close-profile-btn" data-action="close-profile" aria-label="Close profile">${lucideIcon("x", { size: 16 })}</button>
      </div>
      <div class="modal-body">
        <div class="profile-hero">
          <div class="profile-avatar-large">${initials(state.user?.displayName)}</div>
          <div class="profile-hero-info">
            <h4 class="profile-name">${escapeHtml(state.user?.displayName || "Operator")}</h4>
            <span class="profile-email subtle">${escapeHtml(state.user?.email || "operator@synase.local")}</span>
            <span class="status active">${escapeHtml(state.user?.globalRole || "workspace-admin")}</span>
          </div>
        </div>

        <div class="profile-section">
          <div class="profile-label">Current Workspace Context</div>
          <div class="profile-context-box">
            <div>
              <strong>Workspace</strong>
              <span>${escapeHtml(workspace?.name || state.workspaceId)}</span>
            </div>
            <div>
              <strong>Project</strong>
              <span>${escapeHtml(project?.name || state.projectId)}</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <div class="profile-label">Appearance & Theme</div>
          <div class="theme-setting-row">
            <span>Interface Mode</span>
            ${themeToggleMarkup()}
          </div>
        </div>

        <div class="profile-section">
          <div class="profile-label">Session Governance</div>
          <p class="small subtle">Browser session is isolated in mock storage. No credential keys are exposed or saved remotely.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button secondary" id="footer-close-profile-btn" data-action="close-profile">Close</button>
        <button class="button danger" data-action="sign-out">Sign Out</button>
      </div>
    </div>
  </div>`;
}

function renderInviteModal() {
  if (!state.inviteOpen) return "";
  const workspace = state.workspaces.find((w) => w.id === state.workspaceId);
  const inviteLink = `https://synase.ai/join/${state.workspaceId || "ws-default"}?token=inv_${Date.now().toString(36)}`;

  return `<div class="synase-modal-backdrop" data-action="close-modals">
    <div class="synase-modal-dialog invite-dialog">
      <div class="modal-header">
        <div>
          <h3>Invite Team Member</h3>
          <span class="small subtle">Grant access to ${escapeHtml(workspace?.name || "Workspace")}</span>
        </div>
        <button class="icon-btn" id="close-invite-btn" data-action="close-invite" aria-label="Close invite">${lucideIcon("x", { size: 16 })}</button>
      </div>
      <form id="invite-member-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="invite-email">Work Email *</label>
            <input type="email" id="invite-email" name="email" required placeholder="colleague@company.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="invite-name">Full Name *</label>
            <input type="text" id="invite-name" name="name" required placeholder="e.g. Taylor Reed" autocomplete="name" />
          </div>
          <div class="form-group">
            <label for="invite-role">Role & Permissions</label>
            <select id="invite-role" name="role">
              <option value="Admin">Admin · Full access to models, policies, and runs</option>
              <option value="Member" selected>Member · Analysis, repository context, and inputs</option>
              <option value="Viewer">Viewer · Read-only access to decision reports</option>
            </select>
          </div>
          <div class="invite-divider"><span>or share direct link</span></div>
          <div class="share-link-row">
            <input type="text" id="invite-share-link" readonly value="${inviteLink}" />
            <button type="button" class="button secondary" id="copy-invite-link-btn" data-action="copy-invite-link">Copy</button>
          </div>
          <div id="invite-form-message"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="button secondary" id="cancel-invite-btn" data-action="close-invite">Cancel</button>
          <button type="submit" class="button primary" id="submit-invite-btn">Send Invitation</button>
        </div>
      </form>
    </div>
  </div>`;
}

/**
 * Wraps a page body in the persistent chrome.
 * @param {string} content
 * @returns {string}
 */
export function shell(content) {
  const curWorkspace = state.workspaces.find((w) => w.id === state.workspaceId) || state.workspaces[0];
  const curProject = state.projects.find((p) => p.id === state.projectId) || state.projects[0];

  const workspaceOptions = state.workspaces
    .map(
      (workspace) =>
        `<option value="${workspace.id}" ${workspace.id === state.workspaceId ? "selected" : ""}>${escapeHtml(workspace.name)}</option>`
    )
    .join("");
  const projectOptions = state.projects
    .map(
      (project) =>
        `<option value="${project.id}" ${project.id === state.projectId ? "selected" : ""}>${escapeHtml(project.name)}</option>`
    )
    .join("");
  const unreadCount = getActiveNotifications().length;

  return `<div class="shell">
    <div class="sidebar-backdrop ${state.sidebarOpen ? "active" : ""}" data-action="close-sidebar" aria-hidden="true"></div>
    <aside class="sidebar ${state.sidebarOpen ? "open" : ""}" aria-label="Primary navigation">
      <a class="brand" href="#${routes.dashboard}" data-route="${routes.dashboard}">
        <span class="brand-mark" aria-hidden="true">${brandMarkSvg()}</span>
        <span class="brand-copy"><strong>SYNASE AI</strong><span>Decision intelligence</span></span>
      </a>
      <nav>
        <div class="nav-section">
          <div class="nav-label">Assist</div>
          ${navLink(routes.chat, lucideIcon("bot", { size: 16 }), "Chat", true)}
        </div>
        <div class="nav-section">
          <div class="nav-label">Workspace</div>
          ${navLink(routes.work, lucideIcon("layout-dashboard", { size: 16 }), "Work")}
          ${navLink(routes.projects, lucideIcon("folder-kanban", { size: 16 }), "Projects")}
          ${navLink(projectRoute("repository"), lucideIcon("git-branch", { size: 16 }), "Repository")}
          ${navLink(projectRoute("inputs"), lucideIcon("file-up", { size: 16 }), "Inputs")}
          ${navLink(projectRoute("analysis"), lucideIcon("messages-square", { size: 16 }), "Conversation & Analysis")}
          ${navLink(projectRoute("runs"), lucideIcon("play", { size: 16 }), "Execution Runs")}
          ${navLink(routes.members, lucideIcon("users", { size: 16 }), "Members")}
        </div>
        <div class="nav-section">
          <div class="nav-label">Intelligence</div>
          ${navLink("/app/intelligence/product", lucideIcon("boxes", { size: 16 }), "Product Intelligence")}
          ${navLink("/app/intelligence/devops", lucideIcon("activity", { size: 16 }), "DevOps Intelligence")}
          ${navLink("/app/mcp/overview", lucideIcon("network", { size: 16 }), "MCP V2", true)}
          ${navLink("/app/context/overview", lucideIcon("database", { size: 16 }), "Context", true)}
          ${navLink("/app/knowledge/graph", lucideIcon("workflow", { size: 16 }), "Knowledge Graph")}
        </div>
        <div class="nav-section">
          <div class="nav-label">Outputs</div>
          ${navLink("/app/reports", lucideIcon("file-text", { size: 16 }), "Reports", true)}
          ${navLink("/app/approvals", lucideIcon("shield-check", { size: 16 }), "Approvals")}
        </div>
        <div class="nav-section">
          <div class="nav-label">System</div>
          ${navLink("/app/integrations", lucideIcon("blocks", { size: 16 }), "Integrations")}
          ${navLink("/app/activity", lucideIcon("history", { size: 16 }), "Activity & Audit", true)}
          ${navLink(routes.settings, lucideIcon("settings", { size: 16 }), "Settings", true)}
        </div>
      </nav>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn mobile-menu" data-action="toggle-menu" aria-label="Open navigation" aria-expanded="${state.sidebarOpen ? "true" : "false"}">${lucideIcon("menu", { size: 18 })}</button>
          
          <!-- Custom Curved Workspace Switcher -->
          <div class="topbar-dropdown" id="workspace-dropdown-wrap">
            <button
              type="button"
              class="topbar-switcher-btn"
              data-action="topbar-switcher-toggle"
              data-dropdown="workspace"
              aria-haspopup="listbox"
              aria-expanded="false"
              title="Switch Workspace"
            >
              <span class="topbar-switcher-label">${escapeHtml(curWorkspace?.name || "Workspace")}</span>
              <span class="topbar-switcher-chevron" aria-hidden="true">${lucideIcon('chevron-down', { size: 14 })}</span>
            </button>
            <div class="topbar-dropdown-menu" role="listbox" aria-label="Workspaces">
              <div class="topbar-dropdown-header">Workspace</div>
              ${state.workspaces.map((w) => {
                const isSel = w.id === state.workspaceId;
                return `<button
                  type="button"
                  class="topbar-dropdown-item ${isSel ? "is-selected" : ""}"
                  data-action="topbar-pick-workspace"
                  data-workspace-id="${escapeHtml(w.id)}"
                  role="option"
                  aria-selected="${isSel}"
                >
                  <span class="topbar-item-icon">${lucideIcon('layers', { size: 14 })}</span>
                  <span class="topbar-item-name">${escapeHtml(w.name)}</span>
                  ${isSel ? `<span class="topbar-item-check" aria-hidden="true">${lucideIcon('check', { size: 14 })}</span>` : ""}
                </button>`;
              }).join("")}
            </div>
            <select class="context-select-hidden" id="workspace-switcher" style="display:none;" aria-hidden="true">${workspaceOptions}</select>
          </div>

          <!-- Custom Curved Project Switcher -->
          <div class="topbar-dropdown project-context" id="project-dropdown-wrap">
            <button
              type="button"
              class="topbar-switcher-btn"
              data-action="topbar-switcher-toggle"
              data-dropdown="project"
              aria-haspopup="listbox"
              aria-expanded="false"
              title="Switch Project"
            >
              <span class="topbar-switcher-label">${escapeHtml(curProject?.name || "Project")}</span>
              <span class="topbar-switcher-chevron" aria-hidden="true">${lucideIcon('chevron-down', { size: 14 })}</span>
            </button>
            <div class="topbar-dropdown-menu" role="listbox" aria-label="Projects">
              <div class="topbar-dropdown-header">Project</div>
              ${state.projects.map((p) => {
                const isSel = p.id === state.projectId;
                return `<button
                  type="button"
                  class="topbar-dropdown-item ${isSel ? "is-selected" : ""}"
                  data-action="topbar-pick-project"
                  data-project-id="${escapeHtml(p.id)}"
                  role="option"
                  aria-selected="${isSel}"
                >
                  <span class="topbar-item-icon">${lucideIcon('folder-kanban', { size: 14 })}</span>
                  <span class="topbar-item-name">${escapeHtml(p.name)}</span>
                  ${isSel ? `<span class="topbar-item-check" aria-hidden="true">${lucideIcon('check', { size: 14 })}</span>` : ""}
                </button>`;
              }).join("")}
            </div>
            <select class="context-select-hidden project-context" id="project-switcher" style="display:none;" aria-hidden="true">${projectOptions}</select>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="search-trigger" data-action="search" aria-label="Open command palette"><span>${lucideIcon("search", { size: 14 })}</span><span>Search workspace</span><kbd>⌘ K</kbd></button>
          <button class="icon-btn search-trigger-mobile" data-action="search" aria-label="Open command palette">${lucideIcon("search", { size: 16 })}</button>
          <button class="icon-btn notification-btn" data-action="notifications" aria-label="Notifications">
            ${lucideIcon("bell", { size: 16 })}
            ${unreadCount > 0 ? `<span class="badge-dot" title="${unreadCount} notifications">${unreadCount}</span>` : ""}
          </button>
          ${themeToggleMarkup()}
          <button class="avatar" data-action="profile" aria-label="Open user menu" title="${escapeHtml(state.user?.displayName || "Operator")}">${initials(state.user?.displayName || "Operator")}</button>
        </div>
      </header>
      <main id="main" class="content">${content}</main>
    </div>
    ${renderCommandPalette()}
    ${renderNotificationsDrawer()}
    ${renderProfileModal()}
    ${renderInviteModal()}
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
  </div>`;
}