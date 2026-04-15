import type { KnowledgeBase } from "@/data/types";
import data from "@/data/knowledge-base.json";

const raw = data as unknown as KnowledgeBase;

// Normalize optional fields so downstream code doesn't need null checks
raw.concepts = raw.concepts.map((c) => ({
  ...c,
  related_los: c.related_los ?? [],
}));

raw.cases = raw.cases.map((c) => ({
  ...c,
  key_decisions: c.key_decisions ?? [],
  key_takeaways: c.key_takeaways ?? [],
  stage: c.stage ?? "",
}));

const kb = raw;
export default kb;
