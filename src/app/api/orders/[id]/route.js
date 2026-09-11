import { NextResponse } from 'next/server';
import { updateOrderStatus, updateOrderDetails, deleteOrder } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, employeeName = 'Employee', orderDetails, totalAmount, advancePayment, paymentMethod } = body;

    let updatedOrder;

    if (status) {
      updatedOrder = updateOrderStatus(id, status, employeeName);
    }

    if (orderDetails !== undefined || totalAmount !== undefined || advancePayment !== undefined || paymentMethod !== undefined) {
      updatedOrder = updateOrderDetails(id, { orderDetails, totalAmount, advancePayment, paymentMethod });
    }

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'No update parameters provided' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error(`Failed to update order:`, error);
    
    if (error.message === 'Order not found') {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete order:`, error);
    
    if (error.message === 'Order not found') {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}
