import { getAdminDb } from '../server/firebaseAdmin.js';
import { requireAdmin } from '../server/requireAdmin.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método no permitido.' });
  }
  if (!(await requireAdmin(request, response))) return;

  const orderId = typeof request.body?.orderId === 'string' ? request.body.orderId.trim() : '';
  if (!orderId || orderId.length > 150 || orderId.includes('/')) {
    return response.status(400).json({ error: 'El pedido indicado no es válido.' });
  }

  try {
    const db = getAdminDb();
    const orderRef = db.collection('ordenes').doc(orderId);
    const result = await db.runTransaction(async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists) return 'not-found';

      const order = orderSnapshot.data();
      if (order.estado === 'cancelada') return 'already-cancelled';
      if (!['pendiente', 'confirmada'].includes(order.estado)) return 'invalid-state';

      const items = Array.isArray(order.productos) ? order.productos : [];
      const quantityByProduct = new Map();
      for (const item of items) {
        if (typeof item.productId !== 'string' || item.productId.includes('/')) continue;
        const quantity = Number(item.cantidad);
        if (Number.isInteger(quantity) && quantity > 0) {
          quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) || 0) + quantity);
        }
      }

      const refs = [...quantityByProduct.keys()].map((id) => db.collection('productos').doc(id));
      const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
      snapshots.forEach((snapshot, index) => {
        if (snapshot.exists) {
          const ref = refs[index];
          const currentStock = Number(snapshot.data().stock) || 0;
          transaction.update(ref, { stock: currentStock + quantityByProduct.get(ref.id) });
        }
      });
      transaction.update(orderRef, { estado: 'cancelada' });
      return 'cancelled';
    });

    if (result === 'not-found') return response.status(404).json({ error: 'No se encontró el pedido.' });
    if (result === 'invalid-state') return response.status(409).json({ error: 'Solo se pueden cancelar pedidos pendientes o confirmados.' });
    return response.status(200).json({ cancelled: result === 'cancelled' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return response.status(500).json({ error: 'No se pudo cancelar el pedido.' });
  }
}