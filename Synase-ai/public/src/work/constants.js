// @ts-check
/* Static configuration for the Chat & Work surface.

   Modality and effort are product vocabulary, not fixtures, so they live here
   rather than in the adapter. Adding a capability means adding one entry. */

import { lucideIcon } from "../shared/components/icons.js";

/** Layers that can own a work session. */
export const LAYERS = [
  { id: "auto", label: "Auto (Chatbot)", glyph: lucideIcon('sparkles', { size: 15 }), description: "Intelligently routes between Product and DevOps layers" },
  { id: "product", label: "Product Layer", glyph: "P", description: "Requirements, prioritisation, strategy, roadmap" },
  { id: "devops", label: "DevOps Layer", glyph: "D", description: "Findings, dependencies, testing, deployment" }
];

/** Agent capabilities, shown when Agent Mode is selected. */
export const CAPABILITIES = [
  { id: "video", label: "Video", glyph: lucideIcon('play', { size: 16 }), description: "Draft a video storyboard or script outline" },
  { id: "image", label: "Image", glyph: lucideIcon('image', { size: 16 }), description: "Describe an image brief or edit list" },
  { id: "web_search", label: "Web-Search", glyph: lucideIcon('globe', { size: 16 }), description: "Plan a research sweep; no request is issued" },
  { id: "code", label: "Code", glyph: lucideIcon('code', { size: 16 }), description: "Draft an interface or diff for review" },
  { id: "text", label: "Text", glyph: lucideIcon('file-text', { size: 16 }), description: "Plain drafting with no attached artifact" }
];

/** Effort levels, shown once a layer or capability is selected. */
export const EFFORTS = [
  { id: "auto", label: "Auto", description: "Auto-routes you to the right modality" },
  { id: "low", label: "Low", description: "Shortest draft, fewest sections" },
  { id: "medium", label: "Medium", description: "Balanced draft length" },
  { id: "high", label: "High", description: "Wider context, more sections" },
  { id: "max", label: "Max", description: "Deepest draft, longest checklist" }
];

/** Starter prompts offered on an empty session. */
export const STARTERS = [
  { id: "prioritise", label: "Prioritise this quarter", glyph: lucideIcon('list-ordered', { size: 16 }), action: "Rank the open requirements against delivery capacity and show the deferred band separately." },
  { id: "rollout", label: "Review a rollout", glyph: lucideIcon('rocket', { size: 16 }), action: "List what blocks promoting this change to staging, and who has to approve it." },
  { id: "boundary", label: "Draft a boundary", glyph: lucideIcon('shield', { size: 16 }), action: "Propose the service boundary and the contracts it needs before anyone codes it." },
  { id: "research", label: "Plan research", glyph: lucideIcon('compass', { size: 16 }), action: "Outline the questions we need answered before we commit to a direction." }
];

/**
 * @param {string} id
 * @returns {{id: string, label: string, glyph: string, description: string} | undefined}
 */
export const layerById = (id) => LAYERS.find((item) => item.id === id);

/**
 * @param {string} id
 * @returns {{id: string, label: string, glyph: string, description: string} | undefined}
 */
export const capabilityById = (id) => CAPABILITIES.find((item) => item.id === id);

/**
 * @param {string} id
 * @returns {{id: string, label: string, description: string} | undefined}
 */
export const effortById = (id) => EFFORTS.find((item) => item.id === id);