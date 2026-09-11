'use client';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import OrderDetailsDrawer from '@/components/orders/OrderDetailsDrawer';
import { Search, Filter, Calendar, MoreVertical, CheckCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data);
          // If drawer is open, update the selected order data
          if (selectedOrder) {
            const updated = data.data.find(o => o.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, employeeName: 'Employee' })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const formatTimeAMPM = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    const h12 = hNum % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Ready': return 'primary';
      case 'Cancelled':
      case 'Not Collected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Success Toast */}
      {toastMessage && (
        <div style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--success)', 
          color: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 100 
        }}>
          <CheckCircle size={18} />
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Orders Management</h1>
          <p style={{ fontSize: '0.85rem' }}>Track and manage all operational bulk orders.</p>
        </div>
      </div>

      <Card noPadding style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                background: activeTab === tab.id ? 'var(--surface-color)' : 'transparent',
                border: 'none',
                borderRight: '1px solid var(--border-color)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer, Phone..." 
              className="form-control"
              style={{ paddingLeft: '2rem', height: '100%' }}
            />
          </div>
          <Button variant="secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <Filter size={16} /> Filters
          </Button>
          <Button variant="secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <Calendar size={16} /> Date
          </Button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Customer</th>
                <th>Items Summary</th>
                <th>Pickup</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>SSC-{order.id.toString().slice(-4)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.whatsappNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.orderDetails}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.orderDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTimeAMPM(order.orderTime)}</div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      ₹{order.totalAmount}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: order.remainingPayment <= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {order.remainingPayment <= 0 ? 'Paid' : `Bal: ₹${order.remainingPayment}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.paymentMethod || 'Cash'}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(order.status || 'Pending')}>
                        {order.status || 'Pending'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <OrderDetailsDrawer 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onStatusUpdate={handleStatusUpdate}
        onOrderUpdated={fetchOrders}
      />
    </div>
  );
}
