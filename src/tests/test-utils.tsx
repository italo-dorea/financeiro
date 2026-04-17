/**
 * Renderiza qualquer componente envolto nos providers necessários:
 * ChakraProvider, MemoryRouter e AuthContext mockado.
 *
 * Uso:
 *   const { getByText } = renderWithProviders(<MeuComponente />, { authValue: { user: mockUser } });
 */
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

// Tipos do AuthContext
export type MockAuthValue = {
  user?: object | null;
  session?: object | null;
  role?: "admin" | "user" | null;
  isLoading?: boolean;
  signOut?: () => Promise<void>;
};

const defaultAuth: Required<MockAuthValue> = {
  user: null,
  session: null,
  role: null,
  isLoading: false,
  signOut: async () => {},
};

// Criamos um contexto auxiliar para testes (não acoplado ao real)
export const MockAuthContext = React.createContext(defaultAuth);

interface TestProviderOptions extends RenderOptions {
  authValue?: MockAuthValue;
  initialRoute?: string;
}

function AllProviders({
  children,
  authValue = {},
  initialRoute = "/",
}: {
  children: React.ReactNode;
  authValue?: MockAuthValue;
  initialRoute?: string;
}) {
  const ctx = { ...defaultAuth, ...authValue };
  return (
    <MockAuthContext.Provider value={ctx}>
      <ChakraProvider>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </ChakraProvider>
    </MockAuthContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  { authValue, initialRoute, ...opts }: TestProviderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authValue={authValue} initialRoute={initialRoute}>
        {children}
      </AllProviders>
    ),
    ...opts,
  });
}
