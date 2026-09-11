import { NextResponse } from 'next/server';
import { getOrders, addOrder } from '@/lib/db';

export async function GET() {
  try {
    const orders = getOrders();
    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      whatsappNumber,
      orderDetails,
      orderDate,
      orderTime,
      totalAmount,
      advancePayment,
      paymentMethod,
    } = body;

    const parsedTotal = parseFloat(totalAmount);
    const parsedAdvance = parseFloat(advancePayment);
    const remainingPayment = parsedTotal - parsedAdvance;

    const newOrder = addOrder({
      customerName,
      whatsappNumber,
      orderDetails,
      orderDate,
      orderTime,
      totalAmount: parsedTotal,
      advancePayment: parsedAdvance,
      remainingPayment,
      paymentMethod
    });

    return NextResponse.json({ success: true, id: newOrder.id });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
