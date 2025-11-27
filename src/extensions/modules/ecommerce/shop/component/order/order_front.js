import requestClient from '@/plugins/requestClient';
import storageManager from '@/plugins/storage';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

const fetchOrderStatuses = async () => {
    try {
      const response = await Request.POST('shop_order_status/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
      if (response.status === 200) {
        const statuses = response.data;
        statuses.sort((a, b) => a.order - b.order); // Sort by the 'order' field
        return statuses;
      }
      throw new Error('Failed to fetch order statuses');
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      throw error;
    }
  };
  

const fetchOrdersByStatus = async (statusCode) => {
  try {
    const response = await Request.POST('shop_orders/query', { method: 'find', args: [{ unit: session.current._id, status: statusCode }] }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await Request.PUT(`shop_orders/${orderId}`, { data: { status: newStatus } }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to update order status');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export {
  fetchOrderStatuses,
  fetchOrdersByStatus,
  updateOrderStatus
};
