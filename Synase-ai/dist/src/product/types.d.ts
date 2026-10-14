// @ts-check
import type {
  Requirement,
  ProductFeature,
  ProductStrategy,
  RoadmapItem,
  ProductDecision,
  ProductOverview
} from "../shared/types/types.d.ts";

export type ProductSection = "overview" | "requirements" | "prioritization" | "strategy" | "roadmap" | "decisions";

export interface ProductFilterState {
  search: string;
  status: string;
  priority: string;
  provenance: string;
}

export type {
  Requirement,
  ProductFeature,
  ProductStrategy,
  RoadmapItem,
  ProductDecision,
  ProductOverview
};
