import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '@/lib/api';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

interface User {
  id: string;
  email: string;
  role: 'president' | 'secretary' | 'treasurer' | 'member';
  name: string;
  bachatGatId?: string;
  bachatGatName?: string;
  phone?: string;
  address?: {
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  age?: number;
  occupation?: string;
  monthlyIncome?: number;
  aadharNumber?: string;
  passbookFile?: string;
  loanBalance?: number;
  interestRate?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, bachatGatGroup?: string, role?: User['role']) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isLoading: boolean;
  token: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  age: number;
  occupation: string;
  monthlyIncome: number;
  aadharNumber: string;
  gatId?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up axios interceptor to include token in requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('auth_token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, bachatGatGroup?: string, role?: User['role']): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(email, password, bachatGatGroup, role);

      const { token: authToken, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.register(userData);

      const { token: authToken, user: userInfo } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(userInfo));
      
      setToken(authToken);
      setUser(userInfo);
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
};