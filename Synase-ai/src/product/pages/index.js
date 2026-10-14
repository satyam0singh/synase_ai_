// @ts-check
/**
 * Product Intelligence Domain Page (Composition Root)
 * Integrates Overview, Requirements, Prioritization, Strategy, Roadmap, Decisions and Modals.
 */
import { state } from "../../shared/state/store.js";
import { intelligenceHeader } from "../components/intelligenceHeader.js";
import { productModal } from "../components/modals.js";
import { overviewView } from "./overview.js";
import { requirementsView } from "./requirements.js";
import { prioritizationView } from "./prioritization.js";
import { strategyView } from "./strategy.js";
import { roadmapView } from "./roadmap.js";
import { decisionsView } from "./decisions.js";

export {
  overviewView,
  requirementsView,
  prioritizationView,
  strategyView,
  roadmapView,
  decisionsView
};

/**
 * Master Product Intelligence page component.
 * @returns {string}
 */
export function productIntelligencePage() {
  const currentSection = state.productSection || state.productTab || "overview";

  let content = "";
  switch (currentSection) {
    case "requirements":
      content = requirementsView();
      break;
    case "prioritization":
      content = prioritizationView();
      break;
    case "strategy":
      content = strategyView();
      break;
    case "roadmap":
      content = roadmapView();
      break;
    case "decisions":
      content = decisionsView();
      break;
    case "overview":
    default:
      content = overviewView();
      break;
  }

  return `
    <div class="product-intelligence-view">
      ${intelligenceHeader(currentSection)}
      <main class="product-content-area" id="product-content-area">
        ${content}
      </main>
      ${productModal()}
    </div>
  `;
}
