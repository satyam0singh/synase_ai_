// @ts-check
/* Workspace membership. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
import { lucideIcon } from "../../../shared/components/icons.js";
export function membersPage() {
  return `${pageHeader("Workspace administration", "Workspace members", "Manage roles through explicit, non-optimistic mutations. This route is provisional.", `<button class="button primary" data-action="invite">${lucideIcon('plus', { size: 14 })} Invite member</button>`)}
    <div class="alert">Provisional route: workspace member URLs must be approved before backend integration.</div>
    <div class="table-wrap"><table><thead><tr><th>Member</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead><tbody>
      ${state.members.map((member) => `<tr><td><strong>${escapeHtml(member.name)}</strong><br>${escapeHtml(member.email)}</td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.joinedAt)}</td><td>${status("active")}</td></tr>`).join("")}
    </tbody></table></div>`;
}
