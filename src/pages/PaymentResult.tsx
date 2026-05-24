import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, ShoppingBag } from 'lucide-react';

import { API } from '../config/api';

type ResultState = 'loading' | 'approved' | 'pending' | 'rejected';

export default function PaymentResult() {
  const [params] = useSearchParams();
  const [state, setState] = useState<ResultState>('loading');
  const [status, setStatus] = useState<string>('');

  const transactionId = params.get('transactionId') ?? params.get('paymentRef') ?? '';
  const orderNumber   = params.get('orderId') ?? '';

  useEffect(() => {
    if (!transactionId) {
      setState('pending');
      return;
    }

    fetch(`${API}/api/payments/sistecredito/status/${encodeURIComponent(transactionId)}`)
      .then(r => r.json())
      .then(data => {
        const s: string = data.status ?? '';
        setStatus(s);
        if (s === 'Approved') setState('approved');
        else if (s === 'Rejected' || s === 'Cancelled' || s === 'Expired' || s === 'Failed') setState('rejected');
        else setState('pending');
      })
      .catch(() => setState('pending'));
  }, [transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {state === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-orange-500" />
            <h1 className="text-xl font-semibold text-gray-800">Verificando pago...</h1>
            <p className="mt-2 text-gray-500 text-sm">Por favor espera un momento.</p>
          </>
        )}

        {state === 'approved' && (
          <>
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-800">¡Pago aprobado!</h1>
            {orderNumber && (
              <p className="mt-2 text-gray-500 text-sm">Pedido: <span className="font-medium text-gray-700">{orderNumber}</span></p>
            )}
            <p className="mt-3 text-gray-600 text-sm">
              Tu pedido está siendo procesado. Recibirás un correo con la confirmación.
            </p>
          </>
        )}

        {state === 'rejected' && (
          <>
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">Pago rechazado</h1>
            {status && (
              <p className="mt-2 text-sm text-gray-500">Estado: <span className="font-medium">{status}</span></p>
            )}
            <p className="mt-3 text-gray-600 text-sm">
              Tu pago no fue procesado. Puedes intentarlo de nuevo desde el carrito.
            </p>
          </>
        )}

        {state === 'pending' && (
          <>
            <Clock className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800">Pago en proceso</h1>
            {orderNumber && (
              <p className="mt-2 text-gray-500 text-sm">Pedido: <span className="font-medium text-gray-700">{orderNumber}</span></p>
            )}
            <p className="mt-3 text-gray-600 text-sm">
              Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {state === 'rejected' && (
            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Volver al carrito
            </Link>
          )}
          <Link
            to="/catalog"
            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
