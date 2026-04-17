import { describe, it, expect } from "vitest";
import { generateDueDates } from "../../domain/recurrence";
import type { BillRule, Family } from "../../domain/types";

// Helper factories — SOLID: DRY, sem repetição de estrutura
const makeRule = (
  overrides: Partial<Pick<BillRule, "first_due_date" | "is_recurring" | "periodicity" | "repeat_until">>
) => ({
  first_due_date: "2024-01-01",
  is_recurring: false,
  periodicity: null,
  repeat_until: null,
  ...overrides,
});

const makeFamily = (end_date?: string): Pick<Family, "end_date"> => ({
  end_date: end_date ?? null,
});

// TDD: RED -> GREEN -> REFACTOR

describe("generateDueDates — regra nao recorrente", () => {
  it("retorna apenas a data inicial quando is_recurring=false", () => {
    const rule = makeRule({ first_due_date: "2024-03-15", is_recurring: false });
    const result = generateDueDates(rule, makeFamily());
    expect(result).toEqual(["2024-03-15"]);
  });

  it("retorna apenas a data inicial quando is_recurring=true mas sem periodicity", () => {
    const rule = makeRule({ is_recurring: true, periodicity: null });
    const result = generateDueDates(rule, makeFamily());
    expect(result).toEqual(["2024-01-01"]);
  });
});

describe("generateDueDates — recorrencia mensal", () => {
  it("gera 3 datas mensais quando repeat_until e 3 meses depois", () => {
    const rule = makeRule({
      first_due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "monthly",
      repeat_until: "2024-03-01",
    });
    const result = generateDueDates(rule, makeFamily());
    expect(result).toEqual(["2024-01-01", "2024-02-01", "2024-03-01"]);
  });

  it("respeita end_date da familia como limite maximo", () => {
    const rule = makeRule({
      first_due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "monthly",
      repeat_until: "2025-12-01",
    });
    const result = generateDueDates(rule, makeFamily("2024-02-01"));
    expect(result).toEqual(["2024-01-01", "2024-02-01"]);
  });

  it("usa o mais restritivo entre repeat_until e end_date", () => {
    const rule = makeRule({
      first_due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "monthly",
      repeat_until: "2024-02-01",
    });
    const result = generateDueDates(rule, makeFamily("2025-12-01"));
    expect(result).toEqual(["2024-01-01", "2024-02-01"]);
  });
});

describe("generateDueDates — recorrencia semanal", () => {
  it("gera 3 datas semanais corretas", () => {
    const rule = makeRule({
      first_due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "weekly",
      repeat_until: "2024-01-15",
    });
    const result = generateDueDates(rule, makeFamily());
    expect(result).toEqual(["2024-01-01", "2024-01-08", "2024-01-15"]);
  });
});

describe("generateDueDates — recorrencia anual", () => {
  it("gera 3 datas anuais corretas", () => {
    const rule = makeRule({
      first_due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "yearly",
      repeat_until: "2026-01-01",
    });
    const result = generateDueDates(rule, makeFamily());
    expect(result).toEqual(["2024-01-01", "2025-01-01", "2026-01-01"]);
  });
});

describe("generateDueDates — sem family end_date", () => {
  it("sem repeat_until gera datas limitadas ao 2099 (smoke test)", () => {
    const rule = makeRule({
      first_due_date: "2099-11-01",
      is_recurring: true,
      periodicity: "monthly",
      repeat_until: "2099-12-01",
    });
    const result = generateDueDates(rule, makeFamily(undefined));
    expect(result.length).toBe(2);
    expect(result[0]).toBe("2099-11-01");
  });
});
