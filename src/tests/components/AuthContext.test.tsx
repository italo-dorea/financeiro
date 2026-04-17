import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock do supabase ANTES do import do AuthContext
vi.mock("../../lib/supabase", () => import("../mocks/supabase"));

import { supabase } from "../../lib/supabase";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import React from "react";

// Wrapper mínimo para o hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext — fetchRole via user_roles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("define role como 'admin' quando user_roles retorna role=admin", async () => {
    // Mock de getSession retornando uma sessão com user
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    } as any);

    // Mock do from('user_roles') → single retorna { role: 'admin' }
    const qb = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.role).toBe("admin");
    expect(supabase.from).toHaveBeenCalledWith("user_roles");
    expect(qb.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("define role como null quando não há sessão", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.role).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("define role como null se user_roles retornar erro", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    } as any);

    const qb = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(qb as any);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.role).toBeNull();
  });
});
