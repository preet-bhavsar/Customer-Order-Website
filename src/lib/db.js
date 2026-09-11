import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';

// Reference to the 'orders' collection
const ordersCollection = collection(db, 'orders');

export async function getOrders() {
  const snapshot = await getDocs(ordersCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addOrder(order) {
  const timestamp = new Date().toISOString();
  
  const newOrderData = {
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

  const docRef = await addDoc(ordersCollection, newOrderData);
  return { id: docRef.id, ...newOrderData };
}

export async function updateOrderStatus(orderId, newStatus, updatedBy = 'Employee') {
  const orderRef = doc(db, 'orders', orderId.toString());
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const orderData = orderSnap.data();
  const previousStatus = orderData.status;
  const timestamp = new Date().toISOString();

  // If status is the same, do nothing
  if (previousStatus === newStatus) {
    return { id: orderId, ...orderData };
  }

  const newStatusHistory = orderData.statusHistory || [];
  newStatusHistory.push({
    previousStatus,
    newStatus,
    timestamp,
    employee: updatedBy
  });

  const updates = {
    status: newStatus,
    statusUpdatedAt: timestamp,
    statusUpdatedBy: updatedBy,
    statusHistory: newStatusHistory
  };

  await updateDoc(orderRef, updates);
  
  return { id: orderId, ...orderData, ...updates };
}

export async function updateOrderDetails(orderId, updates) {
  const orderRef = doc(db, 'orders', orderId.toString());
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const orderData = orderSnap.data();
  
  const updatedData = {};
  if (updates.orderDetails !== undefined) updatedData.orderDetails = updates.orderDetails;
  if (updates.totalAmount !== undefined) updatedData.totalAmount = Number(updates.totalAmount);
  if (updates.advancePayment !== undefined) updatedData.advancePayment = Number(updates.advancePayment);
  if (updates.paymentMethod !== undefined) updatedData.paymentMethod = updates.paymentMethod;
  
  const newTotalAmount = updatedData.totalAmount !== undefined ? updatedData.totalAmount : orderData.totalAmount;
  const newAdvancePayment = updatedData.advancePayment !== undefined ? updatedData.advancePayment : orderData.advancePayment;
  
  if (newTotalAmount !== undefined && newAdvancePayment !== undefined) {
    updatedData.remainingPayment = newTotalAmount - newAdvancePayment;
  }

  await updateDoc(orderRef, updatedData);
  
  return { id: orderId, ...orderData, ...updatedData };
}

export async function deleteOrder(orderId) {
  const orderRef = doc(db, 'orders', orderId.toString());
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  await deleteDoc(orderRef);
  return true;
}
