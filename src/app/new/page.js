'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TimeKeeper from 'react-timekeeper';

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

export default function NewOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Basic customer info
  const [formData, setFormData] = useState({
    customerName: '',
    whatsappNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: '10:00',
    advancePayment: '',
    paymentMethod: 'Cash',
  });

  // Dynamic items list
  const [items, setItems] = useState(() => [
    { id: Date.now(), category: 'Samosa', name: 'Punjabi Samosa', unit: '1 Pcs', quantity: 100, price: 10 }
  ]);

  // Calculations
  const totalAmount = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)), 0);
  const remainingPayment = totalAmount - (parseFloat(formData.advancePayment) || 0);
  const [whatsappLink, setWhatsappLink] = useState('');

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), category: 'Samosa', name: 'Punjabi Samosa', unit: '1 Pcs', quantity: 1, price: 10 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return; // Prevent removing the last item
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Auto-update default price and unit if category or name changes
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

  const formatTimeAMPM = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    const h12 = hNum % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const generateWhatsappMessage = (orderDetailsStr) => {
    let itemsListStr = items.map(i => `- ${i.quantity} x ${i.name} (${i.unit}) @ ₹${i.price} = ₹${(i.quantity * i.price).toFixed(2)}`).join('%0A');

    const message = `*Swagat Samosa Center - Order Confirmation*%0A%0A` +
      `Hello ${formData.customerName},%0A` +
      `Your bulk order has been confirmed!%0A%0A` +
      `*Order Details:*%0A${itemsListStr}%0A%0A` +
      `*Pickup Date:* ${formData.orderDate}%0A` +
      `*Pickup Time:* ${formatTimeAMPM(formData.orderTime)}%0A%0A` +
      `*Payment Summary:*%0A` +
      `Total Amount: ₹${totalAmount.toFixed(2)}%0A` +
      `Advance Paid: ₹${parseFloat(formData.advancePayment || 0).toFixed(2)} (${formData.paymentMethod})%0A` +
      `*Remaining Balance: ₹${remainingPayment.toFixed(2)}*%0A%0A` +
      `Thank you for choosing Swagat Samosa Center! 🥟`;

    // Clean up phone number (remove spaces, ensure country code)
    let phone = formData.whatsappNumber.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add at least one item.');

    setLoading(true);

    const orderDetailsStr = generateOrderDetailsString();

    const submitData = {
      customerName: formData.customerName,
      whatsappNumber: formData.whatsappNumber,
      orderDetails: orderDetailsStr,
      orderDate: formData.orderDate,
      orderTime: formData.orderTime,
      totalAmount: totalAmount,
      advancePayment: formData.advancePayment || 0,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        const link = generateWhatsappMessage(orderDetailsStr);
        setWhatsappLink(link);
      } else {
        alert('Failed to save order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (whatsappLink) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>✅ Order Saved Successfully!</h2>
        <p style={{ marginBottom: '2rem' }}>The order has been recorded in the database.</p>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#166534' }}>Send WhatsApp Receipt</h3>
          <p style={{ color: '#15803d', marginBottom: '1.5rem' }}>Click the button below to send the auto-generated receipt to the customer.</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#25D366', color: 'white', fontSize: '1.1rem', padding: '1rem 2rem' }}>
            💬 Send WhatsApp Message
          </a>
        </div>

        <button onClick={() => router.push('/')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>New Order</h2>
      <p style={{ marginBottom: '2rem' }}>Enter the customer and order details below.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input type="text" name="customerName" className="form-control" value={formData.customerName} onChange={handleFormChange} required placeholder="e.g. Rahul Kumar" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input type="tel" name="whatsappNumber" className="form-control" value={formData.whatsappNumber} onChange={handleFormChange} required placeholder="10-digit mobile number" />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0', margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Order Items</h3>
            <button type="button" onClick={addItem} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', position: 'relative' }}>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(item.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>
                  &times;
                </button>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Category</label>
                  <select className="form-control" value={item.category} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}>
                    {Object.keys(MENU_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '2 1 200px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Item</label>
                  <select className="form-control" value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}>
                    {MENU_CATEGORIES[item.category].map(menuItem => (
                      <option key={menuItem.name} value={menuItem.name}>
                        {menuItem.name} ({menuItem.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '1 1 100px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Quantity</label>
                  <input type="number" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} required min="1" />
                </div>

                <div style={{ flex: '1 1 100px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Price (₹)</label>
                  <input type="number" className="form-control" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} required min="0" step="0.5" />
                </div>

                <div style={{ flex: '1 1 100px', paddingBottom: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', textAlign: 'right' }}>
                  ₹{(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Pickup Date</label>
            <input type="date" name="orderDate" className="form-control" value={formData.orderDate} onChange={handleFormChange} required />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Pickup Time</label>
            
            {/* Click outside overlay */}
            {showTimePicker && (
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowTimePicker(false)}
              />
            )}
            
            <input 
              type="text" 
              className="form-control" 
              value={formatTimeAMPM(formData.orderTime)} 
              onClick={() => setShowTimePicker(true)} 
              readOnly 
              style={{ cursor: 'pointer', backgroundColor: 'var(--bg-color)' }}
              placeholder="Select Time"
            />
            
            {showTimePicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
                <TimeKeeper 
                  time={formData.orderTime} 
                  onChange={(newTime) => setFormData({ ...formData, orderTime: newTime.formatted24 })} 
                  onDoneClick={() => setShowTimePicker(false)}
                  switchToMinuteOnHourSelect
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Advance Payment (₹)</label>
            <input type="number" name="advancePayment" className="form-control" value={formData.advancePayment} onChange={handleFormChange} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label style={{ 
                padding: '0.5rem 1.25rem', 
                border: formData.paymentMethod === 'Cash' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: formData.paymentMethod === 'Cash' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                color: formData.paymentMethod === 'Cash' ? 'var(--primary-color)' : 'inherit',
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer', 
                fontWeight: formData.paymentMethod === 'Cash' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <input type="radio" name="paymentMethod" value="Cash" checked={formData.paymentMethod === 'Cash'} onChange={handleFormChange} style={{ display: 'none' }} />
                Cash
              </label>
              <label style={{ 
                padding: '0.5rem 1.25rem', 
                border: formData.paymentMethod === 'Online UPI' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: formData.paymentMethod === 'Online UPI' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                color: formData.paymentMethod === 'Online UPI' ? 'var(--primary-color)' : 'inherit',
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                fontWeight: formData.paymentMethod === 'Online UPI' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <input type="radio" name="paymentMethod" value="Online UPI" checked={formData.paymentMethod === 'Online UPI'} onChange={handleFormChange} style={{ display: 'none' }} />
                Online UPI
              </label>
            </div>
          </div>
        </div>

        <div className="summary-box">
          <div className="summary-row">
            <span>Total Items:</span>
            <span>{items.length} unique items</span>
          </div>
          <div className="summary-row">
            <span>Total Amount:</span>
            <span>₹ {totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Advance Paid:</span>
            <span>₹ {parseFloat(formData.advancePayment || 0).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Remaining Payment:</span>
            <span>₹ {remainingPayment.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Order & Generate Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
