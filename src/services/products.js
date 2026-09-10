import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const PRODUCTS_COLLECTION = 'productos';

export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getProductBySlug = async (slug) => {
  const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const getProductsByCategory = async (category) => {
  const q = query(collection(db, PRODUCTS_COLLECTION), where('categoria', '==', category), where('activo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getFeaturedProducts = async () => {
  const q = query(collection(db, PRODUCTS_COLLECTION), where('destacado', '==', true), where('activo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
