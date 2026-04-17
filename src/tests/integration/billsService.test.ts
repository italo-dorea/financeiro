/**
 * Testes de integração do billsService.
 * O Supabase é mockado via __mocks__ — sem I/O real.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock deve ser declarado ANTES do import do serviço
vi.mock("../../lib/supabase", () => import("../mocks/supabase"));

import { billsService } from "../../services/billsService";
import { supabase } from "../../lib/supabase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockBill = {
  id: "occ-1",
  family_id: "fam-1",
  rule_id: "rule-1",
  delegate_id: null,
  name: "Aluguel",
  description: null,
  amount: 1500,
  note: null,
  due_date: "2024-03-01",
  paid: false,
  received: false,
  payment_date: null,
};

function makeQB(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error });
  const qb = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single,
    // Torna o builder awaitable (retorna lista)
    then: (res: (v: unknown) => unknown) =>
      Promise.resolve({ data: Array.isArray(data) ? data : [data], error }).then(res),
  };
  return qb;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("billsService.getAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chama supabase.from('bill_occurrences') e ordena por due_date", async () => {
    const qb = makeQB([mockBill]);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await billsService.getAll();

    expect(supabase.from).toHaveBeenCalledWith("bill_occurrences");
    expect(qb.select).toHaveBeenCalledWith("*");
    expect(qb.order).toHaveBeenCalledWith("due_date", { ascending: true });
  });
});

describe("billsService.create — ocorrência simples (não recorrente)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("insere na tabela bill_occurrences e retorna o dado criado", async () => {
    const payload = {
      family_id: "fam-1",
      name: "Conta de luz",
      amount: 200,
      due_date: "2024-04-01",
      is_recurring: false,
    };
    const qb = makeQB(mockBill);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    const result = await billsService.create(payload);

    expect(supabase.from).toHaveBeenCalledWith("bill_occurrences");
    expect(qb.insert).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});

describe("billsService.create — conta recorrente", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria rule primeiro e chama RPC generate_future_installments", async () => {
    const payload = {
      family_id: "fam-1",
      name: "Aluguel",
      amount: 1200,
      due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "monthly",
      total_installments: 3,
    };

    // Mock: insert na bill_rules → single retorna a regra criada
    const ruleQB = makeQB({ id: "rule-new" });
    vi.mocked(supabase.from).mockReturnValueOnce(ruleQB as any);

    // Mock: RPC bem sucedida
    vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null } as any);

    const result = await billsService.create(payload);

    expect(supabase.from).toHaveBeenCalledWith("bill_rules");
    expect(supabase.rpc).toHaveBeenCalledWith("generate_future_installments", {
      p_rule_id: "rule-new",
      p_installments_count: 3,
    });
    expect(result.error).toBeUndefined();
  });

  it("retorna error se a criação da rule falhar", async () => {
    const payload = {
      family_id: "fam-1",
      name: "Aluguel",
      amount: 1200,
      due_date: "2024-01-01",
      is_recurring: true,
      periodicity: "monthly",
    };

    const ruleError = { message: "DB error" };
    const ruleQB = {
      ...makeQB(null, ruleError),
      single: vi.fn().mockResolvedValue({ data: null, error: ruleError }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(ruleQB as any);

    const result = await billsService.create(payload);

    expect(result.error).toEqual(ruleError);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});

describe("billsService.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("remove campos de regra antes de persistir", async () => {
    const qb = makeQB(mockBill);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await billsService.update("occ-1", {
      paid: true,
      is_recurring: true,   // deve ser ignorado
      periodicity: "monthly", // deve ser ignorado
      total_installments: 5, // deve ser ignorado
    });

    // O insert deve ter sido chamado com o objeto limpo (sem is_recurring, etc.)
    expect(qb.update).toHaveBeenCalledWith({ paid: true });
    expect(qb.eq).toHaveBeenCalledWith("id", "occ-1");
  });
});

describe("billsService.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chama delete com eq no id correto", async () => {
    const qb = makeQB(null);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await billsService.delete("occ-1");

    expect(supabase.from).toHaveBeenCalledWith("bill_occurrences");
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith("id", "occ-1");
  });
});

describe("billsService.deleteBatch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chama delete .in com lista de ids", async () => {
    const qb = makeQB(null);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await billsService.deleteBatch(["occ-1", "occ-2"]);

    expect(qb.delete).toHaveBeenCalled();
    expect(qb.in).toHaveBeenCalledWith("id", ["occ-1", "occ-2"]);
  });
});
