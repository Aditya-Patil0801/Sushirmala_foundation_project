import axios from 'axios';

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create public axios instance for unauthenticated requests
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loops on public pages like login/register
      const currentPath = window.location?.pathname || '';
      const isPublicPath = currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password' || currentPath === '/reset-password';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email: string, password: string, bachatGatGroup?: string, role?: string) =>
    api.post('/auth/login', { email, password, bachatGatGroup, role }),
  
  register: (userData: any) =>
    publicApi.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  
  changePassword: (passwordData: any) =>
    api.put('/auth/change-password', passwordData),
  
  forgotPassword: (email: string) =>
    publicApi.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    publicApi.post('/auth/reset-password', { token, password }),
};

// Bachat Gat API calls
export const bachatGatAPI = {
  getAll: () =>
    api.get('/bachatgat'),
  
getAvailable: () => 
  api.get("/bachatgat/available"),
  
  getById: (id: string) =>
    api.get(`/bachatgat/${id}`),
  
  create: (gatData: any) =>
    api.post('/bachatgat', gatData),
  
  update: (id: string, gatData: any) =>
    api.put(`/bachatgat/${id}`, gatData),
  
  delete: (id: string) =>
    api.delete(`/bachatgat/${id}`),
  
  join: (id: string) =>
    api.post(`/bachatgat/${id}/join`),
  
  leave: (id: string) =>
    api.post(`/bachatgat/${id}/leave`),
  
  assignOfficer: (id: string, officerData: any) =>
    api.post(`/bachatgat/${id}/assign-officer`, officerData),
};

// Meeting API calls
export const meetingAPI = {
  getAll: () =>
    api.get('/meetings'),
  
  getById: (id: string) =>
    api.get(`/meetings/${id}`),
  
  create: (meetingData: any) =>
    api.post('/meetings', meetingData),
  
  update: (id: string, meetingData: any) =>
    api.put(`/meetings/${id}`, meetingData),
  
  updateDecisions: (id: string, decisions: string[]) =>
    api.put(`/meetings/${id}/decisions`, { decisions }),
  
  delete: (id: string) =>
    api.delete(`/meetings/${id}`),
};

// Transaction API calls
export const transactionAPI = {
  getAll: (params?: any) =>
    api.get('/transactions', { params }),
  
  getSummary: () =>
    api.get('/transactions/summary'),
  
  getByBachatGat: (id: string) =>
    api.get(`/transactions/bachat-gat/${id}`),
  
  create: (transactionData: any) =>
    api.post('/transactions', transactionData),
};

// Loan API calls
export const loanAPI = {
  getAll: () =>
    api.get('/loans'),
  
  getByBachatGat: (id: string, params?: any) =>
    api.get(`/loans/bachat-gat/${id}`, { params }),
  
  getByGroup: (id: string, params?: any) =>
    api.get(`/loans/bachat-gat/${id}`, { params }),
  
  getByMember: (id: string) =>
    api.get(`/loans/member/${id}`),
  
  getMyLoans: () =>
    api.get('/loans/my-loans'),
  
  create: (loanData: any) =>
    api.post('/loans', loanData),
  
  update: (id: string, loanData: any) =>
    api.put(`/loans/${id}`, loanData),
  
  updateStatus: (id: string, status: string, remarks?: string) =>
    api.patch(`/loans/${id}/status`, { status, remarks }),
  
  approve: (id: string, remarks?: string) =>
    api.patch(`/loans/${id}/status`, { status: 'approved', remarks }),
  
  reject: (id: string) =>
    api.patch(`/loans/${id}/status`, { status: 'rejected' }),
  
  recordPayment: (id: string, paymentData: any) =>
    api.post(`/loans/${id}/payment`, paymentData),
};

// Scheme API calls
export const schemeAPI = {
  getAll: () =>
    publicApi.get('/schemes'),
  
  getById: (id: string) =>
    publicApi.get(`/schemes/${id}`),
  
  getByGroup: (id: string) =>
    api.get(`/schemes/${id}`),
  
  create: (groupId: string, schemeData: any) =>
    api.post(`/schemes/${groupId}`, schemeData),
  
  update: (groupId: string, schemeId: string, schemeData: any) =>
    api.put(`/schemes/${groupId}/${schemeId}`, schemeData),
  
  delete: (groupId: string, schemeId: string) =>
    api.delete(`/schemes/${groupId}/${schemeId}`),
};

// Member API calls
export const memberAPI = {
  getAll: () =>
    api.get('/members'),
  
  getByBachatGat: (id: string) =>
    api.get(`/members/bachat-gat/${id}`),
  
  updateRole: (id: string, roleData: any) =>
    api.put(`/members/${id}/role`, roleData),
};

// Enquiry API calls
export const enquiryAPI = {
  getAll: () =>
    api.get('/enquiries'),
  
  getByBachatGat: (id: string) =>
    api.get(`/enquiries/bachat-gat/${id}`),
  
  getByGroup: (id: string) =>
    api.get(`/enquiries/bachat-gat/${id}`),
  
  create: (enquiryData: any) =>
    publicApi.post('/enquiries/submit', enquiryData),
  
  updateStatus: (id: string, statusData: any) =>
    api.put(`/enquiries/${id}/status`, statusData),
  
  approve: (id: string, remarks?: string) =>
    api.patch(`/enquiries/${id}/approve`, { remarks }),
  
  reject: (id: string, remarks: string) =>
    api.patch(`/enquiries/${id}/reject`, { remarks }),
};

// Contribution API calls
export const contributionAPI = {
  getAll: () =>
    api.get('/contributions'),
  
  getByBachatGat: (id: string, params?: any) =>
    api.get(`/contributions/bachat-gat/${id}`, { params }),
  
  getByGroup: (id: string, params?: any) =>
    api.get(`/contributions/bachat-gat/${id}`, { params }),
  
  getByMember: (id: string) =>
    api.get(`/contributions/member/${id}`),
  
  getPaidMembers: (id: string, params: any) =>
    api.get(`/contributions/paid-members/${id}`, { params }),
  
  create: (contributionData: any) =>
    api.post('/contributions', contributionData),
  
  delete: (id: string) =>
    api.delete(`/contributions/${id}`),
};

// Upload API calls
export const uploadAPI = {
  uploadPassbook: (file: File) => {
    const formData = new FormData();
    formData.append('passbook', file);
    return api.post('/upload/passbook', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deletePassbook: () =>
    api.delete('/upload/passbook'),
};
