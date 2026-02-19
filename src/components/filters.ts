export type TriState = "all" | "yes" | "no";

export function triStateMatch(v: boolean, filter: TriState) {
  if (filter === "all") return true;
  if (filter === "yes") return v === true;
  return v === false;
}
