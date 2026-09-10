import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'ordenes';
const PRODUCTS_COLLECTION = 'productos';

export const createOrder = async (order, cartItems) => {
  const orderRef = doc(collection(db, ORDERS_COLLECTION));

  const orderData = {
    ...order,
    id: orderRef.id,
    estado: 'pendiente',
    createdAt: new Date().toISOString(),
  };

  await setDoc(orderRef, orderData);

  for (const item of cartItems) {
    const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentStock = productSnap.data().stock || 0;
      await updateDoc(productRef, { stock: Math.max(0, currentStock - item.cantidad) });
    }
  }

  return orderData;
};

export const getOrderById = async (id) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
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
  for (const item of order.productos) {
    const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentStock = productSnap.data().stock || 0;
      await updateDoc(productRef, { stock: currentStock + item.cantidad });
    }
  }
  await updateOrderStatus(order.id, 'cancelada');
};
