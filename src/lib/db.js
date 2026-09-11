import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'orders.json');

// Initialize DB if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

export function getOrders() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

export function addOrder(order) {
  const orders = getOrders();
  const timestamp = new Date().toISOString();
  
  const newOrder = {
    id: Date.now(),
    ...order,
    status: 'Pending',
    statusUpdatedAt: timestamp,
    statusUpdatedBy: 'System',
    statusHistory: [
      {
        previousStatus: null,
        newStatus: 'Pending',
        timestamp: timestamp,
        employee: 'System'
      }
    ],
    createdAt: timestamp
  };
  orders.push(newOrder);
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
  return newOrder;
}

export function updateOrderStatus(orderId, newStatus, updatedBy = 'Employee') {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id.toString() === orderId.toString());
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  const order = orders[orderIndex];
  const previousStatus = order.status;
  const timestamp = new Date().toISOString();

  // If status is the same, do nothing
  if (previousStatus === newStatus) {
    return order;
  }

  order.status = newStatus;
  order.statusUpdatedAt = timestamp;
  order.statusUpdatedBy = updatedBy;

  if (!order.statusHistory) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    previousStatus,
    newStatus,
    timestamp,
    employee: updatedBy
  });

  orders[orderIndex] = order;
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
  
  return order;
}

export function updateOrderDetails(orderId, updates) {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id.toString() === orderId.toString());
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  const order = orders[orderIndex];
  
  if (updates.orderDetails !== undefined) order.orderDetails = updates.orderDetails;
  if (updates.totalAmount !== undefined) order.totalAmount = Number(updates.totalAmount);
  if (updates.advancePayment !== undefined) order.advancePayment = Number(updates.advancePayment);
  if (updates.paymentMethod !== undefined) order.paymentMethod = updates.paymentMethod;
  
  if (updates.totalAmount !== undefined || updates.advancePayment !== undefined) {
    order.remainingPayment = order.totalAmount - order.advancePayment;
  }

  orders[orderIndex] = order;
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
  
  return order;
}

export function deleteOrder(orderId) {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id.toString() === orderId.toString());
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  orders.splice(orderIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
  
  return true;
}
