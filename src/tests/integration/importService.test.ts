import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/supabase", () => import("../mocks/supabase"));

import { importService } from "../../services/importService";
import { supabase } from "../../lib/supabase";
import type { BillOccurrence } from "../../domain/types";

const makeBill = (id: string): Partial<BillOccurrence> => ({
  family_id: "fam-1",
  name: `Fatura ${id}`,
  amount: 100,
  due_date: "2024-01-01",
  paid: false,
  received: false,
});

function makeQB(error: unknown = null) {
  return {
    insert: vi.fn().mockReturnThis(),
    then: (res: (v: unknown) => unknown) =>
      Promise.resolve({ data: null, error }).then(res),
  };
}

describe("importService.importBillsBatch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna count igual ao número de bills bem-sucedidos", async () => {
    const bills = [makeBill("1"), makeBill("2")];

    // Ambos os inserts retornam sucesso (error = null)
    bills.forEach(() =>
      vi.mocked(supabase.from).mockReturnValueOnce(makeQB(null) as any)
    );

    const result = await importService.importBillsBatch(bills);
    expect(result.count).toBe(2);
    expect(result.error).toBeNull();
  });

  it("conta apenas os sucessos em caso de falha parcial", async () => {
    const bills = [makeBill("1"), makeBill("2"), makeBill("3")];

    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeQB(null) as any)       // sucesso
      .mockReturnValueOnce(makeQB({ message: "err" }) as any) // falha
      .mockReturnValueOnce(makeQB(null) as any);      // sucesso

    const result = await importService.importBillsBatch(bills);
    expect(result.count).toBe(2);
    expect(result.error).toBeNull(); // parcial → não retorna erro global
  });

  it("retorna error apenas se TODOS os inserts falharem", async () => {
    const bills = [makeBill("1"), makeBill("2")];
    const dbError = { message: "constraint violation" };

    bills.forEach(() =>
      vi.mocked(supabase.from).mockReturnValueOnce(makeQB(dbError) as any)
    );

    const result = await importService.importBillsBatch(bills);
    expect(result.count).toBe(0);
    expect(result.error).toEqual(dbError);
  });

  it("retorna count=0 e error=null para array vazio", async () => {
    const result = await importService.importBillsBatch([]);
    expect(result.count).toBe(0);
    expect(result.error).toBeNull();
  });
});
