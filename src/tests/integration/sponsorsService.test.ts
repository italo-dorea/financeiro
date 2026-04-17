import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/supabase", () => import("../mocks/supabase"));

import { sponsorsService } from "../../services/sponsorsService";
import { supabase } from "../../lib/supabase";

const mockSponsor = { id: "sp-1", name: "Patrocinador 1", email: "sp@test.com", phone: null, created_at: null };

function makeQB(data: unknown, error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: (res: (v: unknown) => unknown) =>
      Promise.resolve({ data: Array.isArray(data) ? data : [], error }).then(res),
  };
}

describe("sponsorsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll — busca em 'sponsors' ordenado por name", async () => {
    const qb = makeQB([mockSponsor]);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);
    await sponsorsService.getAll();
    expect(supabase.from).toHaveBeenCalledWith("sponsors");
    expect(qb.order).toHaveBeenCalledWith("name");
  });

  it("create — insere e retorna single", async () => {
    const qb = makeQB(mockSponsor);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);
    const result = await sponsorsService.create({ name: "Novo" });
    expect(qb.insert).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  it("update — atualiza pelo id correto", async () => {
    const qb = makeQB(mockSponsor);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);
    await sponsorsService.update("sp-1", { name: "Atualizado" });
    expect(qb.update).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith("id", "sp-1");
  });

  it("delete — deleta pelo id correto", async () => {
    const qb = makeQB(null);
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);
    await sponsorsService.delete("sp-1");
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith("id", "sp-1");
  });
});
