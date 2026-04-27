const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateOrder(id: string, updateData: any) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  async deleteOrder(id: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
  },

  async getOrderByReceipt(receiptNumber: string) {
    const res = await fetch(`${API_BASE_URL}/orders/receipt/${receiptNumber}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },
  
  async getInventory() {
    const res = await fetch(`${API_BASE_URL}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async updateInventory(id: string, updateData: any) {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async getCustomers() {
    const res = await fetch(`${API_BASE_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }
};
