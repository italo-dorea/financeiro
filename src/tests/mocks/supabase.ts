/**
 * Mock global do cliente Supabase.
 * Vitest injeta este arquivo automaticamente quando um módulo importa '../lib/supabase'.
 *
 * Cada teste pode sobrescrever o comportamento chamando:
 *   vi.mocked(supabase.from).mockImplementation(...)
 */
import { vi } from "vitest";

// Builder encadeável imutável: .from().select().eq().single() → retorna a si mesmo até o await
const buildQueryBuilder = (overrides: Record<string, unknown> = {}) => {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  // Torna o próprio builder uma Promise para os casos de await direto
  builder.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: [], error: null }).then(resolve);
  return builder;
};

export const supabase = {
  from: vi.fn(() => buildQueryBuilder()),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

/** Helpers para testes — criam um query builder que resolve com valores customizados */
export function mockFromOnce(
  data: unknown,
  error: unknown = null,
  singleData?: unknown
) {
  const qb = buildQueryBuilder({
    single: vi.fn().mockResolvedValue({ data: singleData ?? data, error }),
  });
  qb.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data, error }).then(resolve);
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce(qb);
  return qb;
}
