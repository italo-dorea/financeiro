import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/supabase", () => import("../mocks/supabase"));

import { familiesService } from "../../services/familiesService";
import { supabase } from "../../lib/supabase";

const mockFamily = {
  id: "fam-1",
  name: "Família Silva",
  observations: null,
  start_date: "2024-01-01",
  end_date: null,
  sponsor_id: null,
};

function makeQB(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error });
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single,
    then: (res: (v: unknown) => unknown) =>
      Promise.resolve({ data: Array.isArray(data) ? data : [], error }).then(res),
  };
}

describe("familiesService.getAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca de families ordenado por created_at desc", async () => {
    const qb = makeQB([mockFamily]);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await familiesService.getAll();

    expect(supabase.from).toHaveBeenCalledWith("families");
    expect(qb.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("familiesService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("insere a família e retorna o registro criado", async () => {
    const payload = { name: "Nova Família", start_date: "2024-06-01" };
    const qb = makeQB(mockFamily);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    const result = await familiesService.create(payload);

    expect(supabase.from).toHaveBeenCalledWith("families");
    expect(qb.insert).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});

describe("familiesService.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza família pelo id correto", async () => {
    const qb = makeQB(mockFamily);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await familiesService.update("fam-1", { name: "Família Atualizada" });

    expect(qb.update).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith("id", "fam-1");
  });
});

describe("familiesService.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deleta família pelo id", async () => {
    const qb = makeQB(null);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    await familiesService.delete("fam-1");

    expect(supabase.from).toHaveBeenCalledWith("families");
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith("id", "fam-1");
  });
});
