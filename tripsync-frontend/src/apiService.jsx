// API Configuration
const API_BASE_URL = '/api';

// Hardcoded token for development
//const HARDCODED_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzaHJhZGRoYUBleGFtcGxlLmNvbSIsImlhdCI6MTc2NDI4ODQ4NywiZXhwIjoxNzY0Mzc0ODg3fQ.fWS2nhtCtkpgM8qLBgYKehEHMYYpn6kGRV0fItofMxxfNEBGA6wum_rSNLDCJbTJ';

// Token management
export const TokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
};

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = TokenManager.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  // Handle 204 No Content response
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {};
  }
  
  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return {};
};

// Authentication API
export const AuthAPI = {
  register: async (userData) => {
    return await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }),
    });
  },

  login: async (email, password) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      TokenManager.setToken(response.token);
    }
    return response;
  },

  getCurrentUser: async () => {
    return await apiFetch('/auth/me');
  },

  logout: () => {
    TokenManager.removeToken();
  },
};

// Trips API
export const TripsAPI = {
  getAllTrips: async () => apiFetch('/trips'),
  
  getTripById: async (tripId) => apiFetch(`/trips/${tripId}`),
  
  createTrip: async (tripData) => {
    return await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },
  
  updateTrip: async (tripId, tripData) => {
    return await apiFetch(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },
  
  deleteTrip: async (tripId) => {
    return await apiFetch(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },
};

// Tasks API
export const TasksAPI = {
  getTasksForTrip: async (tripId) => apiFetch(`/trips/${tripId}/tasks`),
  
  createTask: async (tripId, taskData) => {
    return await apiFetch(`/trips/${tripId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },
  
  updateTaskStatus: async (taskId, status) => {
    return await apiFetch(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  
  deleteTask: async (taskId) => {
    return await apiFetch(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// Expenses API
export const ExpensesAPI = {
  getExpensesForTrip: async (tripId) => apiFetch(`/trips/${tripId}/expenses`),
  
  createExpense: async (tripId, expenseData) => {
    return await apiFetch(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },
  
  getExpenseBalances: async (tripId) => apiFetch(`/trips/${tripId}/expenses/balances`),
  
  deleteExpense: async (expenseId) => {
    return await apiFetch(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};
// Participants/Invite API
export const InviteAPI = {
  // Change from GET to POST to create a new invite
  generateInviteLink: async (tripId) => {
    return await apiFetch(`/trips/${tripId}/invites`, {
      method: 'POST',  // Changed from GET to POST
      body: JSON.stringify({}), // Empty body for POST request
    });
  },
  
  // Get invite details by token
  getInviteDetails: async (token) => {
    return await apiFetch(`/invites/${token}`);
  },
  
  // Accept an invite
  acceptInvite: async (token) => {
    return await apiFetch(`/invites/${token}/accept`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  
  // Get all invites for a trip
  getTripInvites: async (tripId) => {
    return await apiFetch(`/trips/${tripId}/invites`);
  },
  
  // Revoke an invite
  revokeInvite: async (tripId, token) => {
    return await apiFetch(`/trips/${tripId}/invites/${token}`, {
      method: 'DELETE',
    });
  },
  
  registerWithInvite: async (userData, inviteToken) => {
    return await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        inviteToken: inviteToken,
      }),
    });
  },
  
  getTripParticipants: async (tripId) => {
  return await apiFetch(`/api/trips/trips/${tripId}/participants`);
},
};

// Stops API
export const StopsAPI = {
  addStopToTrip: async (tripId, stopData) => {
    return await apiFetch(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    });
  },
  
  getAllStops: async (tripId) => {
    return await apiFetch(`/trips/${tripId}/stops`);
  },
  
  voteOnStop: async (stopId, voteType) => {
    return await apiFetch(`/stops/${stopId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },
  
  reorderStops: async (tripId, stopIds) => {
    return await apiFetch(`/trips/${tripId}/stops/reorder`, {
      method: 'POST',
      body: JSON.stringify({ stopIds }),
    });
  },
  
  deleteStop: async (stopId) => {
  return await apiFetch(`/stops/${stopId}`, {
    method: 'DELETE',
  });
},
};