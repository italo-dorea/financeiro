import { describe, it, expect } from "vitest";
import { triStateMatch } from "../../components/filters";

describe("triStateMatch", () => {
  it('retorna true para qualquer valor quando filter="all"', () => {
    expect(triStateMatch(true, "all")).toBe(true);
    expect(triStateMatch(false, "all")).toBe(true);
  });

  it('retorna true apenas para true quando filter="yes"', () => {
    expect(triStateMatch(true, "yes")).toBe(true);
    expect(triStateMatch(false, "yes")).toBe(false);
  });

  it('retorna true apenas para false quando filter="no"', () => {
    expect(triStateMatch(false, "no")).toBe(true);
    expect(triStateMatch(true, "no")).toBe(false);
  });
});
