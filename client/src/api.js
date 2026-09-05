const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for making API requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/api/health'),

  // Categories
  getCategories: () => request('/api/categories'),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Expenses
  getExpenses: (category) => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/api/expenses${query}`);
  },

  getExpenseById: (id) => request(`/api/expenses/${id}`),

  createExpense: (expenseData) =>
    request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    }),

  updateExpense: (id, expenseData) =>
    request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    }),

  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, {
      method: 'DELETE'
    })
};
