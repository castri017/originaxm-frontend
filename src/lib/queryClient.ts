import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos del catálogo cambian poco: 5 min sin volver a pedirlos al navegar.
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
