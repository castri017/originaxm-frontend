import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { fetchMyReview, fetchProductReviews, fetchRatingSummaries, submitReview } from './api';
import type { RatingSummary } from './types';

export const reviewKeys = {
  all:       ['reviews'] as const,
  product:   (id: string) => [...reviewKeys.all, 'product', id] as const,
  mine:      (id: string, customerId: string) => [...reviewKeys.all, 'mine', id, customerId] as const,
  summaries: () => [...reviewKeys.all, 'summaries'] as const,
};

export const useProductReviews = (productId: string) =>
  useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: ({ signal }) => fetchProductReviews(productId, signal),
    staleTime: 60 * 1000,
  });

/** Promedios de todos los productos en una sola consulta, compartida por todas las tarjetas. */
export function useRatingSummaries(): Map<string, RatingSummary> {
  const { data } = useQuery({
    queryKey: reviewKeys.summaries(),
    queryFn: ({ signal }) => fetchRatingSummaries(signal),
    staleTime: 5 * 60 * 1000,
  });
  return useMemo(() => new Map((data ?? []).map(s => [s.productId, s])), [data]);
}

/** Estado del cliente logueado frente a este producto. Sin sesión no consulta nada. */
export function useMyReview(productId: string) {
  const customerId = useCustomerAuthStore(s => s.customer?.id);
  return useQuery({
    queryKey: reviewKeys.mine(productId, customerId ?? 'anon'),
    queryFn: () => fetchMyReview(productId),
    enabled: !!customerId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useSubmitReview(productId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; comment: string }) => submitReview(productId, input),
    // La reseña queda pendiente: solo cambia el estado del cliente, no la lista pública.
    onSuccess: () => client.invalidateQueries({ queryKey: [...reviewKeys.all, 'mine', productId] }),
  });
}
