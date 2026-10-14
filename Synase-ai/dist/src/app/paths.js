// @ts-check
/* Route table and navigation primitives.

   These were the top of src/app.js. They are dependency-free so that both
   app/shell.js and app/router.js can import them without a cycle. */

import { state } from "../shared/state/store.js";

export const routes = {
  chat: "/app/chat",
  work: "/app/dashboard",
  dashboard: "/app/dashboard",
  projects: "/app/projects",
  createProject: "/app/projects/create",
  members: "/app/workspaces/ws_synase/members",
  workspaceSettings: "/app/workspaces/ws_synase/settings",
  settings: "/app/settings"
};

/**
 * @param {string} segment
 * @returns {string}
 */
export function projectRoute(segment) {
  return `/app/projects/${state.projectId || "prj_platform"}/${segment}`;
}

/** @returns {string} */
export function currentPath() {
  const queryRoute = new URLSearchParams(location.search).get("route");
  return queryRoute || location.hash.slice(1) || routes.dashboard;
}

/**
 * @param {string} path
 */
export function navigate(path) {
  try {
    const url = new URL(location.href);
    url.searchParams.delete("route");
    history.replaceState(null, "", `${url.pathname}${url.search ? url.search : ""}#${path}`);
  } catch (_) {
    history.replaceState(null, "", `${location.pathname}#${path}`);
  }
  state.sidebarOpen = false;
}

/**
 * @param {string} path
 * @param {boolean} [prefix]
 * @returns {boolean}
 */
export function isActive(path, prefix = false) {
  const cur = currentPath();
  if (path === routes.projects) {
    return cur === "/app/projects" || cur === "/app/projects/create";
  }
  if (path === routes.settings) {
    return cur.startsWith("/app/settings");
  }
  if (path === "/app/activity" && (cur === "/app/activity" || cur === "/app/audit"))
    return true;
  return prefix ? cur.startsWith(path) : cur === path;
}

/**
 * The route groups that previously owned their own renderer. Recorded here so
 * the router is the single source of truth for navigation.
 * @param {string} [value]
 * @returns {boolean}
 */
export function isIntegrationsRoute(value = currentPath()) {
  return (
    value === "/app/integrations" ||
    /^\/app\/projects\/[^/]+\/integrations$/.test(value) ||
    value === "/app/activity" ||
    value === "/app/audit"
  );
}