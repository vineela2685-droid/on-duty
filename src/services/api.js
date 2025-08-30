const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  // Health check
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // User operations
  async getUsers() {
    const res = await fetch('http://localhost:5000/users');
    return await res.json();
  },

  async createUser(data) {
    const res = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
