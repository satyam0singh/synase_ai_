import { writeFile } from 'node:fs/promises';
import { icons } from 'lucide';

const iconNames = [
  'Sun', 'Moon', 'Cpu', 'GitBranch', 'Boxes', 'Activity', 'ShieldCheck', 'Network',
  'Workflow', 'Presentation', 'FlaskConical', 'Wrench', 'MessageSquare', 'UploadCloud',
  'Check', 'Bot', 'LayoutDashboard', 'FolderKanban', 'FileUp', 'MessagesSquare',
  'Play', 'Users', 'Database', 'FileText', 'Blocks', 'History', 'Settings',
  'Search', 'Bell', 'Menu', 'X', 'ArrowRight', 'Palette', 'Sparkles', 'Zap',
  'FileKey', 'Mail', 'Code', 'Repeat', 'BarChart3', 'Shield', 'Download',
  'Sliders', 'LayoutGrid', 'ListTodo', 'SlidersHorizontal', 'Compass', 'Milestone',
  'Flag', 'Plus', 'Layers', 'Terminal', 'Share2', 'CheckCircle', 'AlertCircle', 'ExternalLink',
  'Mic', 'Image', 'Globe', 'ChevronDown', 'ChevronUp', 'ChevronRight', 'Paperclip', 'Send',
  'Copy', 'Trash2', 'Edit3', 'Eye', 'EyeOff', 'GitPullRequest', 'Rocket', 'ListOrdered'
];

const iconData = {};
for (const name of iconNames) {
  if (icons[name]) {
    iconData[name] = icons[name];
  } else {
    console.warn('Missing icon:', name);
  }
}

let code = `// @ts-check
/**
 * Official Lucide Icons System (https://lucide.dev/icons/)
 * Provides statically compiled, dependency-free SVG rendering for all UI components.
 */

export const LUCIDE_ICONS = ${JSON.stringify(iconData, null, 2)};

/**
 * Renders an official Lucide SVG icon string.
 * @param {string} name - PascalCase, kebab-case, or lowercase icon name (e.g., 'Activity', 'git-branch', 'sun')
 * @param {Object} [options]
 * @param {number|string} [options.size=18]
 * @param {number|string} [options.strokeWidth=2]
 * @param {string} [options.color='currentColor']
 * @param {string} [options.className='']
 * @returns {string}
 */
export function lucideIcon(name, options = {}) {
  const {
    size = 18,
    strokeWidth = 2,
    color = 'currentColor',
    className = ''
  } = options;

  if (!name) return '';

  // Normalize name to PascalCase
  const pascalName = name
    .replace(/^([a-z])/, (m, c) => c.toUpperCase())
    .replace(/[-_]([a-z0-9])/g, (m, c) => c.toUpperCase());

  const iconDef = LUCIDE_ICONS[pascalName] || LUCIDE_ICONS[name];
  if (!iconDef) {
    return '';
  }

  const children = iconDef
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => \`\${k}="\${v}"\`)
        .join(' ');
      return \`<\${tag} \${attrStr}/>\`;
    })
    .join('');

  const cls = className ? \`lucide lucide-\${name.toLowerCase()} \${className}\` : \`lucide lucide-\${name.toLowerCase()}\`;

  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="\${color}" stroke-width="\${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="\${cls}" aria-hidden="true">\${children}</svg>\`;
}
`;

await writeFile(new URL('../src/shared/components/icons.js', import.meta.url), code);
console.log('Successfully generated src/shared/components/icons.js with', Object.keys(iconData).length, 'icons');
