import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { getAllOrders, updateOrderStatus, restoreStock } from '../services/orders';
import { auth } from '../services/firebase';
import { formatPrice } from '../utils/formatPrice';
import './Admin.css';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  enviada: 'Enviada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const STATUS_COLORS = {
  pendiente: 'admin__status--pendiente',
  confirmada: 'admin__status--confirmada',
  enviada: 'admin__status--enviada',
  entregada: 'admin__status--entregada',
  cancelada: 'admin__status--cancelada',
};

const normalizeWhatsAppPhone = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('54')) {
    digits = digits.slice(2).replace(/^0/, '');
    return `549${digits}`;
  }

  return `549${digits.replace(/^0/, '')}`;
};

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    if (window.innerWidth <= 768) {
      setDrawerOpen(true);
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, estado: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRestoreStock = async (order) => {
    if (!confirm(`¿Restaurar stock para el pedido ${order.id}? Se devolverán ${order.productos.length} productos al stock.`)) return;
    try {
      await restoreStock(order);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, estado: 'cancelada' } : o))
      );
      setSelectedOrder((prev) => (prev?.id === order.id ? { ...prev, estado: 'cancelada' } : prev));
      alert('Stock restaurado y pedido cancelado');
    } catch (error) {
      console.error('Error restoring stock:', error);
      alert('Error al restaurar stock');
    }
  };

  if (loading) {
    return (
      <div className="admin container section">
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="admin container section">
      <div className="admin__heading">
        <div>
          <h1 className="admin__title">Panel de administración</h1>
          <p className="admin__subtitle">{orders.length} pedidos registrados</p>
        </div>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => signOut(auth)}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin__layout">
        <div className="admin__list">
          {orders.length === 0 ? (
            <p className="admin__empty">No hay pedidos registrados.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className={`admin__order-card ${selectedOrder?.id === order.id ? 'admin__order-card--selected' : ''}`}
                onClick={() => handleSelectOrder(order)}
              >
                <div className="admin__order-header">
                  <span className="admin__order-id">{order.id}</span>
                  <span className={`admin__status ${STATUS_COLORS[order.estado]}`}>
                    {STATUS_LABELS[order.estado]}
                  </span>
                </div>
                <div className="admin__order-info">
                  <span>{order.cliente.nombre} {order.cliente.apellido}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="admin__order-date">
                  {new Date(order.createdAt).toLocaleDateString('es-AR')}
                </div>
                {normalizeWhatsAppPhone(order.cliente.telefono) && (
                  <a
                    className="admin__whatsapp-link"
                    href={`https://wa.me/${normalizeWhatsAppPhone(order.cliente.telefono)}?text=${encodeURIComponent(`Hola ${order.cliente.nombre}, te contacto por tu pedido ${order.id}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {selectedOrder && (
          <div className="admin__detail">
            <h2 className="admin__detail-title">Pedido {selectedOrder.id}</h2>

            <div className="admin__detail-section">
              <h3>Cliente</h3>
              <p>{selectedOrder.cliente.nombre} {selectedOrder.cliente.apellido}</p>
              <p>Tel: {selectedOrder.cliente.telefono}</p>
              <p>Email: {selectedOrder.cliente.email}</p>
            </div>

            <div className="admin__detail-section">
              <h3>Entrega</h3>
              <p>{selectedOrder.entrega.tipo === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
              {selectedOrder.entrega.tipo === 'envio' && (
                <>
                  <p>{selectedOrder.entrega.direccion}</p>
                  <p>{selectedOrder.entrega.localidad}</p>
                </>
              )}
            </div>

            <div className="admin__detail-section">
              <h3>Productos</h3>
              {selectedOrder.productos.map((item, i) => (
                <div key={i} className="admin__detail-product">
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="admin__detail-total">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="admin__detail-section">
              <h3>Estado</h3>
              <div className="admin__status-buttons">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    className={`btn btn-sm ${selectedOrder.estado === key ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleStatusChange(selectedOrder.id, key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {selectedOrder.estado !== 'cancelada' && (
              <div className="admin__detail-section">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRestoreStock(selectedOrder)}
                >
                  Cancelar y restaurar stock
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer lateral - mobile */}
      {selectedOrder && (
        <>
          <div
            className={`admin__drawer-backdrop ${drawerOpen ? 'admin__drawer-backdrop--open' : ''}`}
            onClick={closeDrawer}
          />
          <div className={`admin__drawer ${drawerOpen ? 'admin__drawer--open' : ''}`}>
            <div className="admin__drawer-header">
              <h2>Pedido {selectedOrder.id}</h2>
              <button className="admin__drawer-close" onClick={closeDrawer}>✕</button>
            </div>
            <div className="admin__drawer-content">
              <div className="admin__detail-section">
                <h3>Cliente</h3>
                <p>{selectedOrder.cliente.nombre} {selectedOrder.cliente.apellido}</p>
                <p>Tel: {selectedOrder.cliente.telefono}</p>
                <p>Email: {selectedOrder.cliente.email}</p>
              </div>

              <div className="admin__detail-section">
                <h3>Entrega</h3>
                <p>{selectedOrder.entrega.tipo === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                {selectedOrder.entrega.tipo === 'envio' && (
                  <>
                    <p>{selectedOrder.entrega.direccion}</p>
                    <p>{selectedOrder.entrega.localidad}</p>
                  </>
                )}
              </div>

              <div className="admin__detail-section">
                <h3>Productos</h3>
                {selectedOrder.productos.map((item, i) => (
                  <div key={i} className="admin__detail-product">
                    <span>{item.nombre} x{item.cantidad}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div className="admin__detail-total">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="admin__detail-section">
                <h3>Estado</h3>
                <div className="admin__status-buttons">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className={`btn btn-sm ${selectedOrder.estado === key ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleStatusChange(selectedOrder.id, key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.estado !== 'cancelada' && (
                <div className="admin__detail-section">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      handleRestoreStock(selectedOrder);
                      closeDrawer();
                    }}
                  >
                    Cancelar y restaurar stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
