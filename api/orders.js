import { getAdminDb } from '../server/firebaseAdmin.js';

const cleanText = (value, maxLength = 200) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método no permitido.' });
  }

  const { order, cartItems } = request.body || {};
  const cliente = order?.cliente || {};
  const entrega = order?.entrega || {};
  const metodoPago = order?.metodoPago;

  if (
    !cleanText(cliente.nombre) || !cleanText(cliente.apellido) ||
    !cleanText(cliente.telefono) || !/^\S+@\S+\.\S+$/.test(cleanText(cliente.email)) ||
    !['envio', 'retiro'].includes(entrega.tipo) ||
    (entrega.tipo === 'envio' && (!cleanText(entrega.direccion) || !cleanText(entrega.localidad))) ||
    !['transferencia', 'efectivo'].includes(metodoPago) ||
    !Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50
  ) {
    return response.status(400).json({ error: 'Los datos del pedido están incompletos o no son válidos.' });
  }

  const quantitiesByProduct = new Map();
  for (const item of cartItems) {
    const id = cleanText(item?.id, 120);
    const quantity = Number(item?.cantidad);
    if (!id || id.includes('/') || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return response.status(400).json({ error: 'El carrito contiene un producto o cantidad no válidos.' });
    }
    quantitiesByProduct.set(id, (quantitiesByProduct.get(id) || 0) + quantity);
  }

  if ([...quantitiesByProduct.values()].some((quantity) => quantity > 100)) {
    return response.status(400).json({ error: 'La cantidad solicitada supera el límite permitido.' });
  }

  try {
    const db = getAdminDb();
    const orderRef = db.collection('ordenes').doc();
    const productRefs = [...quantitiesByProduct.keys()].map((id) => db.collection('productos').doc(id));

    const orderData = await db.runTransaction(async (transaction) => {
      const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
      const products = snapshots.map((snapshot, index) => {
        if (!snapshot.exists || snapshot.data().activo !== true) {
          throw new Error('STOCK_INSUFFICIENT:producto');
        }

        const product = snapshot.data();
        const quantity = quantitiesByProduct.get(snapshot.id);
        const stock = Number(product.stock) || 0;
        const price = Number(product.precio);
        if (stock < quantity) throw new Error(`STOCK_INSUFFICIENT:${product.nombre || 'producto'}`);
        if (!Number.isFinite(price) || price < 0) throw new Error('PRODUCT_INVALID');
        return { ref: productRefs[index], product, quantity, price };
      });

      const items = products.map(({ product, quantity, price }, index) => ({
        productId: productRefs[index].id,
        nombre: cleanText(product.nombre),
        cantidad: quantity,
        precioUnitario: price,
        subtotal: price * quantity,
      }));
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      const savedOrder = {
        id: orderRef.id,
        cliente: {
          nombre: cleanText(cliente.nombre),
          apellido: cleanText(cliente.apellido),
          telefono: cleanText(cliente.telefono, 40),
          email: cleanText(cliente.email, 254).toLowerCase(),
        },
        entrega: {
          tipo: entrega.tipo,
          direccion: cleanText(entrega.direccion),
          localidad: cleanText(entrega.localidad),
          codigoPostal: cleanText(entrega.codigoPostal, 30),
          referencia: cleanText(entrega.referencia, 500),
        },
        productos: items,
        subtotal: total,
        total,
        metodoPago,
        estado: 'pendiente',
        createdAt: new Date().toISOString(),
      };

      for (const { ref, product, quantity } of products) {
        transaction.update(ref, { stock: (Number(product.stock) || 0) - quantity });
      }
      transaction.set(orderRef, savedOrder);
      return savedOrder;
    });

    return response.status(201).json({ order: orderData });
  } catch (error) {
    if (error.message?.startsWith('STOCK_INSUFFICIENT:')) {
      return response.status(409).json({ error: error.message });
    }
    console.error('Error creating order:', error);
    return response.status(500).json({ error: 'No se pudo procesar el pedido.' });
  }
}