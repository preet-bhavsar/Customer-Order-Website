'use client';
import { useEffect, useState } from 'react';
import OrderDetailsDrawer from '@/components/orders/OrderDetailsDrawer';
import { getOrders, updateOrderStatus } from '@/lib/db';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, 'Employee');
      showToast(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      {/* Success Toast */}
      {toastMessage && (
        <div style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#2e7d32', 
          color: 'white', padding: '1rem 1.5rem', borderRadius: '4px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 100 
        }}>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Recent Orders</h2>
        <span style={{ color: 'var(--text-muted)' }}>{orders.length} total orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No orders found. Click &quot;New Order&quot; to add one.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Customer</th>
                <th>Order Details</th>
                <th>Total (₹)</th>
                <th>Advance (₹)</th>
                <th>Remaining (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td data-label="Date / Time">
                    <div style={{ fontWeight: 500 }}>{order.orderDate}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.orderTime}</div>
                  </td>
                  <td data-label="Customer">
                    <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.whatsappNumber}</div>
                  </td>
                  <td data-label="Order Details">{order.orderDetails}</td>
                  <td data-label="Total (₹)" style={{ fontWeight: 600 }}>₹{order.totalAmount}</td>
                  <td data-label="Advance (₹)" style={{ color: 'var(--success)', fontWeight: 500 }}>₹{order.advancePayment}</td>
                  <td data-label="Remaining (₹)" style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{order.remainingPayment}</td>
                  <td data-label="Status">
                    <span className="badge badge-pending">
                      {order.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailsDrawer 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onStatusUpdate={handleStatusUpdate}
        onOrderUpdated={(msg) => {
          if (msg) showToast(msg);
          fetchOrders();
        }}
      />
    </div>
  );
}
