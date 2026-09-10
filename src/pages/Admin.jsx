import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, restoreStock } from '../services/orders';
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
      <h1 className="admin__title">Panel de administración</h1>
      <p className="admin__subtitle">{orders.length} pedidos registrados</p>

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
