const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('b2b_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('b2b_token', token);
      } else {
        localStorage.removeItem('b2b_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('b2b_token');
    }
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.code || `HTTP Error ${response.status}`;
      throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' }).catch(() => null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Products
  async getProducts(params?: { search?: string; category?: string; includeInactive?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.includeInactive) query.append('includeInactive', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, qty: number) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, qty }),
    });
  }

  async updateCartItem(itemId: string, qty: number) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty }),
    });
  }

  async removeCartItem(itemId: string) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Orders
  async checkout(poNumber?: string, paymentTerms?: string) {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ poNumber, paymentTerms }),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Invoices
  async getInvoice(orderId: string) {
    return this.request(`/invoices/${orderId}`);
  }

  // Admin
  async getAdminStock() {
    return this.request('/admin/stock');
  }

  async adjustStock(productId: string, delta: number, reason: string) {
    return this.request(`/admin/products/${productId}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ delta, reason }),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getAuditLogs(limit = 50) {
    return this.request(`/admin/audit-logs?limit=${limit}`);
  }

  async getStockLogs(limit = 50) {
    return this.request(`/admin/stock-logs?limit=${limit}`);
  }
}

export const api = new ApiClient();
