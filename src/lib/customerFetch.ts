import { useCustomerAuthStore } from '../store/useCustomerAuthStore';

/**
 * `fetch` para la tienda con la sesión del cliente: agrega su token si hay uno y, si la API
 * responde 401 (token vencido o inválido), cierra la sesión para que vuelva a iniciarla.
 */
export async function customerFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { customer, logout } = useCustomerAuthStore.getState();
  const token = customer?.token;

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && token) logout();

  return res;
}
