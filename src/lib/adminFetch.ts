import { useAdminAuthStore } from '../store/useAdminAuthStore';

/**
 * `fetch` para el panel de administración: agrega el token del SuperAdmin y, si la API
 * responde 401 (token vencido o inválido), cierra la sesión para volver al login.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { token, logout } = useAdminAuthStore.getState();

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && token) logout();

  return res;
}
