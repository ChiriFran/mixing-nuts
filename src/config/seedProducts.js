import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  { id: 'almendras-1kg', nombre: 'Almendras', slug: 'almendras', descripcion: 'Almendras enteras de primera calidad, crudas y sin sal. Perfectas para snacks saludables, repostería y cocinar.', descripcionCorta: 'Almendras enteras crudas sin sal.', categoria: 'Frutos secos', imagen: '/images/products/almendras.png', precio: 23900, precioTransferencia: 25095, presentacion: '1 kg', ingredientes: ['Almendras'], stock: 50, destacado: true, activo: true, orden: 1 },
  { id: 'nueces-1kg', nombre: 'Nueces', slug: 'nueces', descripcion: 'Nueces enteras selectas, ricas en omega 3 y nutrientes esenciales.', descripcionCorta: 'Nueces enteras selectas.', categoria: 'Frutos secos', imagen: '/images/products/nueces.png', precio: 22700, precioTransferencia: 23835, presentacion: '1 kg', ingredientes: ['Nueces'], stock: 40, destacado: true, activo: true, orden: 2 },
  { id: 'caju-1kg', nombre: 'Caju', slug: 'caju', descripcion: 'Castañas de caju Premium, cremosas y ligeramente dulces.', descripcionCorta: 'Caju Premium cremoso.', categoria: 'Frutos secos', imagen: '/images/products/caju.png', precio: 22100, precioTransferencia: 23205, presentacion: '1 kg', ingredientes: ['Caju'], stock: 35, destacado: false, activo: true, orden: 3 },
  { id: 'mani-sal-1kg', nombre: 'Maní sin sal', slug: 'mani-sin-sal', descripcion: 'Maní crocante sin sal, ideal para snacking y cocinar.', descripcionCorta: 'Maní crocante sin sal.', categoria: 'Frutos secos', imagen: '/images/products/mani.png', precio: 4500, precioTransferencia: 4725, presentacion: '1 kg', ingredientes: ['Maní'], stock: 60, destacado: false, activo: true, orden: 4 },
  { id: 'bananitas-1kg', nombre: 'Bananitas', slug: 'bananitas', descripcion: 'Bananitas deshidratadas, dulces y naturales.', descripcionCorta: 'Bananitas deshidratadas naturales.', categoria: 'Deshidratados', imagen: '/images/products/bananitas.png', precio: 14800, precioTransferencia: 15540, presentacion: '1 kg', ingredientes: ['Banana'], stock: 30, destacado: false, activo: true, orden: 5 },
  { id: 'pasas-uva-1kg', nombre: 'Pasas de uva', slug: 'pasas-de-uva', descripcion: 'Pasas de uva seleccionadas, dulces y jugosas.', descripcionCorta: 'Pasas de uva dulces y jugosas.', categoria: 'Deshidratados', imagen: '/images/products/pasas.png', precio: 6900, precioTransferencia: 7245, presentacion: '1 kg', ingredientes: ['Pasas de uva'], stock: 45, destacado: false, activo: true, orden: 6 },
  { id: 'arandanos-1kg', nombre: 'Arándanos deshidratados', slug: 'arandanos-deshidratados', descripcion: 'Arándanos deshidratados, ricos en antioxidantes.', descripcionCorta: 'Arándanos deshidratados antioxidantes.', categoria: 'Deshidratados', imagen: '/images/products/arandanos.png', precio: 15400, precioTransferencia: 16170, presentacion: '1 kg', ingredientes: ['Arándanos'], stock: 25, destacado: false, activo: true, orden: 7 },
  { id: 'mix-completo-1kg', nombre: 'Mix Completo', slug: 'mix-completo', descripcion: 'Nuestra selección completa: nueces, caju, almendras, maní, pasas de uva y bananitas.', descripcionCorta: 'Selección completa de frutos secos y frutas.', categoria: 'Mixes', imagen: '/images/products/mix-completo.png', precio: 14500, precioTransferencia: 15225, presentacion: '1 kg', ingredientes: ['Nueces', 'Caju', 'Almendras', 'Maní', 'Pasas de uva', 'Bananitas'], stock: 40, destacado: true, activo: true, orden: 1 },
  { id: 'mix-premium-1kg', nombre: 'Mix Premium', slug: 'mix-premium', descripcion: 'Nuestro mix más selecto: nueces, caju y almendras de primera calidad.', descripcionCorta: 'Selección premium de frutos secos.', categoria: 'Mixes', imagen: '/images/products/mix-premium.png', precio: 22500, precioTransferencia: 23625, presentacion: '1 kg', ingredientes: ['Nueces', 'Caju', 'Almendras'], stock: 30, destacado: true, activo: true, orden: 2 },
  { id: 'mix-intermedio-1kg', nombre: 'Mix Intermedio', slug: 'mix-intermedio', descripcion: 'El equilibrio perfecto: nueces, caju, almendras y maní.', descripcionCorta: 'Equilibrio perfecto de frutos secos.', categoria: 'Mixes', imagen: '/images/products/mix-intermedio.png', precio: 15800, precioTransferencia: 16590, presentacion: '1 kg', ingredientes: ['Nueces', 'Caju', 'Almendras', 'Maní'], stock: 35, destacado: false, activo: true, orden: 3 },
  { id: 'mix-tropical-1kg', nombre: 'Mix Tropical', slug: 'mix-tropical', descripcion: 'Un toque tropical: almendras, maní y pasas de uva.', descripcionCorta: 'Toque tropical con frutos secos y pasas.', categoria: 'Mixes', imagen: '/images/products/mix-tropical.png', precio: 12300, precioTransferencia: 12915, presentacion: '1 kg', ingredientes: ['Almendras', 'Maní', 'Pasas de uva'], stock: 40, destacado: false, activo: true, orden: 4 },
  { id: 'mix-brasil-1kg', nombre: 'Mix Brasil', slug: 'mix-brasil', descripcion: 'Inspirado en Brasil: nueces, almendras, maní, pasas de uva y bananitas.', descripcionCorta: 'Inspiración brasileña con frutos secos.', categoria: 'Mixes', imagen: '/images/products/mix-brasil.png', precio: 11900, precioTransferencia: 12495, presentacion: '1 kg', ingredientes: ['Nueces', 'Almendras', 'Maní', 'Pasas de uva', 'Bananitas'], stock: 35, destacado: false, activo: true, orden: 5 },
  { id: 'aceite-oliva-pocitana-5l', nombre: 'Aceite de oliva PociTana', slug: 'aceite-oliva-pocitana', descripcion: 'Aceite de oliva extra virgen PociTana, 5 litros.', descripcionCorta: 'Aceite de oliva EVOO 5L.', categoria: 'Aceites', imagen: '/images/products/aceite-pocitana.png', precio: 185000, precioTransferencia: 194250, presentacion: '5 L', ingredientes: ['Aceite de oliva extra virgen'], stock: 10, destacado: false, activo: true, orden: 1 },
  { id: 'aceite-oliva-laur-500', nombre: 'Aceite de oliva Laur', slug: 'aceite-oliva-laur-500', descripcion: 'Aceite de oliva extra virgen Laur, 500 cc.', descripcionCorta: 'Aceite de oliva EVOO 500cc.', categoria: 'Aceites', imagen: '/images/products/aceite-laur-500.png', precio: 16500, precioTransferencia: 17325, presentacion: '500 cc', ingredientes: ['Aceite de oliva extra virgen'], stock: 20, destacado: false, activo: true, orden: 2 },
  { id: 'aceite-oliva-laur-250', nombre: 'Aceite de oliva Laur', slug: 'aceite-oliva-laur-250', descripcion: 'Aceite de oliva extra virgen Laur, 250 cc.', descripcionCorta: 'Aceite de oliva EVOO 250cc.', categoria: 'Aceites', imagen: '/images/products/aceite-laur-250.png', precio: 8500, precioTransferencia: 8925, presentacion: '250 cc', ingredientes: ['Aceite de oliva extra virgen'], stock: 25, destacado: false, activo: true, orden: 3 },
  { id: 'aceite-coco-360', nombre: 'Aceite de coco', slug: 'aceite-de-coco', descripcion: 'Aceite de coco natural, 360 cc.', descripcionCorta: 'Aceite de coco natural.', categoria: 'Aceites', imagen: '/images/products/aceite-coco.png', precio: 7500, precioTransferencia: 7875, presentacion: '360 cc', ingredientes: ['Aceite de coco'], stock: 15, destacado: false, activo: true, orden: 4 },
  { id: 'harina-almendras-100g', nombre: 'Harina de almendras', slug: 'harina-de-almendras', descripcion: 'Harina de almendras finamente molida, ideal para repostería sin gluten.', descripcionCorta: 'Harina de almendras sin gluten.', categoria: 'Harinas', imagen: '/images/products/harina-almendras.png', precio: 800, precioTransferencia: 840, presentacion: '100 g', ingredientes: ['Almendras'], stock: 50, destacado: false, activo: true, orden: 1 },
  { id: 'vino-susurros-malbec', nombre: 'Vino Susurros Malbec', slug: 'vino-susurros-malbec', descripcion: 'Vino tinto Susurros Malbec, ideal para maridar con frutos secos.', descripcionCorta: 'Vino tinto Susurros Malbec.', categoria: 'Bebidas', imagen: '/images/products/vino-susurros.png', precio: 3900, precioTransferencia: 4095, presentacion: '750 ml', ingredientes: ['Malbec'], stock: 20, destacado: false, activo: true, orden: 1 },
  { id: 'vino-casimiro-torrontes', nombre: 'Vino Casimiro Torrontés', slug: 'vino-casimiro-torrontes', descripcion: 'Vino blanco Casimiro Torrontés, fresco y aromático.', descripcionCorta: 'Vino blanco Casimiro Torrontés.', categoria: 'Bebidas', imagen: '/images/products/vino-casimiro.png', precio: 5500, precioTransferencia: 5775, presentacion: '750 ml', ingredientes: ['Torrontés'], stock: 15, destacado: false, activo: true, orden: 2 },
];

const categories = [
  { id: 'frutos-secos', nombre: 'Frutos secos', slug: 'frutos-secos', imagen: '/images/categories/frutos-secos.png', orden: 1 },
  { id: 'mixes', nombre: 'Mixes', slug: 'mixes', imagen: '/images/categories/mixes.png', orden: 2 },
  { id: 'deshidratados', nombre: 'Deshidratados', slug: 'deshidratados', imagen: '/images/categories/deshidratados.png', orden: 3 },
  { id: 'aceites', nombre: 'Aceites', slug: 'aceites', imagen: '/images/categories/aceites.png', orden: 4 },
  { id: 'harinas', nombre: 'Harinas', slug: 'harinas', imagen: '/images/categories/harinas.png', orden: 5 },
  { id: 'bebidas', nombre: 'Bebidas', slug: 'bebidas', imagen: '/images/categories/bebidas.png', orden: 6 },
];

async function seedProducts() {
  const productsRef = collection(db, 'productos');
  for (const product of products) {
    const { id, ...productData } = product;
    await setDoc(doc(productsRef, id), productData);
    console.log(`✓ Producto subido: ${product.nombre}`);
  }
}

async function seedCategories() {
  const categoriesRef = collection(db, 'categorias');
  for (const category of categories) {
    const { id, ...categoryData } = category;
    await setDoc(doc(categoriesRef, id), categoryData);
    console.log(`✓ Categoría subida: ${category.nombre}`);
  }
}

async function main() {
  try {
    console.log('Subiendo productos a Firestore...');
    await seedProducts();
    console.log('\nSubiendo categorías a Firestore...');
    await seedCategories();
    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  }
}

main();
