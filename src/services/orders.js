import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';

const ORDERS_COLLECTION = 'ordenes';

export const createOrder = async (order, cartItems) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order, cartItems }),
  });
  const result = await response.json();

  if (!response.ok) throw new Error(result.error || 'No se pudo crear el pedido.');
  return result.order;
};

export const getAllOrders = async () => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateOrderStatus = async (id, status) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(docRef, { estado: status });
};

export const restoreStock = async (order) => {
  const user = auth.currentUser;
  if (!user) throw new Error('La sesión de administrador no está activa.');

  const response = await fetch('/api/cancel-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId: order.id }),
  });
  const result = await response.json();

  if (!response.ok) throw new Error(result.error || 'No se pudo cancelar el pedido.');
};
