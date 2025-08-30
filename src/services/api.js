const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  // Health check
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // User operations
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
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
