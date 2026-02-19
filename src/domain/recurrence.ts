import { addMonths, addWeeks, addYears, isAfter, parseISO } from "date-fns";
import type { BillRule, Family } from "./types";

/**
 * Gera lista de datas (YYYY-MM-DD) para ocorrências, respeitando:
 * - se não recorrente: só 1 ocorrência (first_due_date)
 * - se recorrente: repete até min(repeat_until, family.end_date) (inclusive)
 */
export function generateDueDates(
  rule: Pick<BillRule, "first_due_date" | "is_recurring" | "periodicity" | "repeat_until">,
  family: Pick<Family, "end_date">
): string[] {
  const first = parseISO(rule.first_due_date);

  const hardEnd = parseISO(family.end_date);
  const softEnd = rule.repeat_until ? parseISO(rule.repeat_until) : hardEnd;
  const end = isAfter(softEnd, hardEnd) ? hardEnd : softEnd;

  if (!rule.is_recurring) return [rule.first_due_date];
  if (!rule.periodicity) return [rule.first_due_date];

  const dates: string[] = [];
  let cur = first;

  while (!isAfter(cur, end)) {
    dates.push(cur.toISOString().slice(0, 10)); // YYYY-MM-DD
    if (rule.periodicity === "weekly") cur = addWeeks(cur, 1);
    if (rule.periodicity === "monthly") cur = addMonths(cur, 1);
    if (rule.periodicity === "yearly") cur = addYears(cur, 1);
  }

  return dates;
}
