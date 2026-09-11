import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { X, Clock, CheckCircle2, AlertCircle, Edit2, Check, X as XIcon, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Completed',
  'Not Collected',
  'Cancelled'
];

const MENU_CATEGORIES = {
  "Samosa": [
    { name: "Punjabi Samosa", unit: "1 Pcs", defaultPrice: 10 },
    { name: "Chinese Samosa", unit: "4 Pcs", defaultPrice: 20 },
    { name: "Patti Samosa", unit: "3 Pcs", defaultPrice: 20 },
    { name: "Mexican Samosa", unit: "1 Pcs", defaultPrice: 20 },
    { name: "Cheese Samosa", unit: "1 Pcs", defaultPrice: 10 },
    { name: "Pizza Samosa", unit: "1 Pcs", defaultPrice: 10 },
  ],
  "Bhajiya": [
    { name: "Dal wada", unit: "1 kg", defaultPrice: 300 },
    { name: "Gota Bhajiya", unit: "1 kg", defaultPrice: 300 },
    { name: "Aloo Bhajiya", unit: "1 kg", defaultPrice: 300 },
    { name: "Mix Bhajiya", unit: "1 kg", defaultPrice: 300 },
  ],
  "Khaman": [
    { name: "Dal Khaman", unit: "1 kg", defaultPrice: 200 },
    { name: "Nylon Khaman", unit: "1 kg", defaultPrice: 200 },
    { name: "Idada", unit: "1 kg", defaultPrice: 160 },
  ],
  "Other Snacks": [
    { name: "Jalebi", unit: "1 kg", defaultPrice: 240 },
    { name: "Fafda", unit: "1 kg", defaultPrice: 500 },
    { name: "Handva", unit: "1 kg", defaultPrice: 300 },
    { name: "Khandvi", unit: "1 kg", defaultPrice: 300 },
    { name: "Bread Pakoda", unit: "1 Pcs", defaultPrice: 20 },
    { name: "Methi Thepla", unit: "1 Packet", defaultPrice: 40 },
  ]
};

const parseOrderDetails = (detailsStr) => {
  if (!detailsStr) return [];
  const parts = detailsStr.split(', ');
  const parsedItems = parts.map((part, index) => {
    const match = part.match(/([\d.]+)\s*x\s*(.+?)\s*\((.*?)\)\s*@\s*₹([\d.]+)/);
    if (match) {
      const quantity = parseFloat(match[1]);
      const name = match[2].trim();
      const unit = match[3].trim();
      const price = parseFloat(match[4]);
      
      let category = 'Other Snacks';
      for (const [cat, menuItems] of Object.entries(MENU_CATEGORIES)) {
        if (menuItems.some(m => m.name === name)) {
          category = cat;
          break;
        }
      }
      return { id: Date.now() + index, category, name, unit, quantity, price };
    }
    return null;
  }).filter(Boolean);
  
  if (parsedItems.length === 0) {
    return [{ id: Date.now(), category: 'Samosa', name: 'Punjabi Samosa', unit: '1 Pcs', quantity: 1, price: 10 }];
  }
  return parsedItems;
};

const formatTimeAMPM = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hNum = parseInt(h, 10);
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  const h12 = hNum % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export default function OrderDetailsDrawer({ order, onClose, onStatusUpdate, onOrderUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState([]);
  const [editedAdvance, setEditedAdvance] = useState(order?.advancePayment || 0);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState(order?.paymentMethod || 'Cash');
  
  const editedTotal = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)), 0);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(parseOrderDetails(order.orderDetails));
      setEditedAdvance(order.advancePayment || 0);
      setEditedPaymentMethod(order.paymentMethod || 'Cash');
      setIsEditing(false);
    }
  }, [order]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), category: 'Samosa', name: 'Punjabi Samosa', unit: '1 Pcs', quantity: 1, price: 10 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'category') {
          const firstItemInCategory = MENU_CATEGORIES[value][0];
          updatedItem.name = firstItemInCategory.name;
          updatedItem.unit = firstItemInCategory.unit;
          updatedItem.price = firstItemInCategory.defaultPrice;
        } else if (field === 'name') {
          const menuItem = MENU_CATEGORIES[item.category].find(m => m.name === value);
          if (menuItem) {
            updatedItem.unit = menuItem.unit;
            updatedItem.price = menuItem.defaultPrice;
          }
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const generateOrderDetailsString = () => {
    return items.map(i => `${i.quantity} x ${i.name} (${i.unit}) @ ₹${i.price}`).join(', ');
  };

  if (!order) return null;

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setIsConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    setLoading(true);
    await onStatusUpdate(order.id, selectedStatus);
    setLoading(false);
    setIsConfirmOpen(false);
  };

  const cancelStatusChange = () => {
    setSelectedStatus(order.status || 'Pending');
    setIsConfirmOpen(false);
  };

  const saveOrderDetails = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: generateOrderDetailsString(),
          totalAmount: editedTotal,
          advancePayment: editedAdvance,
          paymentMethod: editedPaymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onOrderUpdated) {
          onOrderUpdated('Order details updated');
        }
        setIsEditing(false);
      } else {
        alert(data.error || 'Failed to update order details');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving details.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOrder = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (onOrderUpdated) {
          onOrderUpdated('Order deleted successfully');
        }
        onClose();
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the order.');
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '100%',
    maxWidth: '480px',
    height: '100vh',
    backgroundColor: 'var(--bg-color)',
    boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
    zIndex: 90,
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--border-color)',
  };

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
    <>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 89 }}
        onClick={onClose}
      />
      <div style={drawerStyle}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Order Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>SSC-{order.id.toString().slice(-4)}</div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Status</div>
              <Badge variant={getStatusBadgeVariant(order.status || 'Pending')}>{order.status || 'Pending'}</Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.customerName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+91 {order.whatsappNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pickup</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.orderDate}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTimeAMPM(order.orderTime)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Update Status</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select 
                className="form-control" 
                value={order.status || 'Pending'} 
                onChange={handleStatusChange}
                style={{ flex: 1 }}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Order Timeline</h3>
            <div style={{ marginLeft: '0.5rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(order.statusHistory || [{ newStatus: 'Pending', timestamp: order.createdAt || new Date().toISOString() }]).map((history, idx) => {
                const date = new Date(history.timestamp);
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.35rem', top: '0.15rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '2px solid var(--bg-color)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{history.newStatus}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {history.employee || 'System'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Items & Billing</h3>
              {!isEditing ? (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setItems(parseOrderDetails(order.orderDetails));
                      setEditedAdvance(order.advancePayment || 0);
                      setEditedPaymentMethod(order.paymentMethod || 'Cash');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}
                  >
                    <XIcon size={14} /> Cancel
                  </button>
                  <button 
                    onClick={saveOrderDetails}
                    disabled={isSaving}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                  >
                    <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-main)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                  {order.orderDetails}
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Advance Paid ({order.paymentMethod || 'Cash'})</span>
                    <span>- ₹{order.advancePayment}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span>Remaining</span>
                    <span style={{ color: order.remainingPayment > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      ₹{order.remainingPayment}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order Items</label>
                  <button type="button" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>+ Add Item</button>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>&times;</button>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                      <div style={{ flex: '1 1 40%' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category</label>
                        <select className="form-control" value={item.category} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          {Object.keys(MENU_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: '1 1 50%' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Item</label>
                        <select className="form-control" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          {MENU_CATEGORIES[item.category]?.map(menuItem => <option key={menuItem.name} value={menuItem.name}>{menuItem.name}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: '1 1 25%' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Qty</label>
                        <input type="number" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} />
                      </div>
                      <div style={{ flex: '1 1 25%' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Price (₹)</label>
                        <input type="number" className="form-control" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount (₹)</label>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--border-color)' }}>₹{editedTotal.toFixed(2)}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Advance Paid (₹)</label>
                    <input
                      type="number"
                      value={editedAdvance}
                      onChange={(e) => setEditedAdvance(e.target.value)}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Payment Method</label>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <label style={{ 
                        flex: 1,
                        padding: '0.4rem 0.75rem', 
                        border: editedPaymentMethod === 'Cash' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: editedPaymentMethod === 'Cash' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                        color: editedPaymentMethod === 'Cash' ? 'var(--primary-color)' : 'inherit',
                        borderRadius: 'var(--radius-md)', 
                        cursor: 'pointer', 
                        fontWeight: editedPaymentMethod === 'Cash' ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}>
                        <input type="radio" value="Cash" checked={editedPaymentMethod === 'Cash'} onChange={(e) => setEditedPaymentMethod(e.target.value)} style={{ display: 'none' }} />
                        Cash
                      </label>
                      <label style={{ 
                        flex: 1,
                        padding: '0.4rem 0.75rem', 
                        border: editedPaymentMethod === 'Online UPI' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: editedPaymentMethod === 'Online UPI' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                        color: editedPaymentMethod === 'Online UPI' ? 'var(--primary-color)' : 'inherit',
                        borderRadius: 'var(--radius-md)', 
                        cursor: 'pointer',
                        fontWeight: editedPaymentMethod === 'Online UPI' ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}>
                        <input type="radio" value="Online UPI" checked={editedPaymentMethod === 'Online UPI'} onChange={(e) => setEditedPaymentMethod(e.target.value)} style={{ display: 'none' }} />
                        Online UPI
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>New Remaining:</span>
                  <span style={{ fontWeight: 600, color: (editedTotal - editedAdvance) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ₹{(editedTotal - editedAdvance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Change Order Status?"
        message={
          <span>
            Are you sure you want to change the status of this order from <strong>{order.status || 'Pending'}</strong> to <strong>{selectedStatus}</strong>?
          </span>
        }
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        confirmText={loading ? 'Updating...' : 'Confirm Change'}
      />

      <ConfirmationDialog 
        isOpen={isDeleteConfirmOpen}
        title="Delete Order?"
        message={
          <span>
            Are you sure you want to permanently delete order <strong>SSC-{order.id.toString().slice(-4)}</strong>? This action cannot be undone.
          </span>
        }
        onConfirm={deleteOrder}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Order'}
      />
    </>
  );
}
