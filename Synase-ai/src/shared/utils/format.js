// @ts-check
/* Presentation helpers shared by every domain. Kept as one module because
   they are tiny and always used together when building a view. */

/**
 * Escapes a value for safe interpolation into HTML template strings.
 * @param {unknown} [value]
 * @returns {string}
 */
export function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[char]
  );
}

/**
 * @param {unknown} [name]
 * @returns {string}
 */
export function initials(name = "User") {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * @param {number} [bytes]
 * @returns {string}
 */
export function formatBytes(bytes = 0) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}