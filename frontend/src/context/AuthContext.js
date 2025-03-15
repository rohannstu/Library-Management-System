import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Set the default Authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user info if token exists
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Add event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial online status
    setIsOfflineMode(!navigator.onLine);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnline = () => {
    console.log('App is online');
    setIsOfflineMode(false);
    // Optionally refresh data when coming back online
    if (currentUser) {
      fetchCurrentUser();
    }
  };

  const handleOffline = () => {
    console.log('App is offline');
    setIsOfflineMode(true);
    setError('You are currently offline. Using local data.');
  };

  const fetchCurrentUser = async () => {
    try {
      // Get user info from the backend
      const response = await authAPI.getCurrentUser();
      console.log('Current user data from API:', response.data);
      setCurrentUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching current user:', err);
      
      if (!navigator.onLine) {
        setError('You are offline. Using local data.');
      } else {
        setError('Failed to fetch user information. Using mock data instead.');
      }
      
      // Try to get mock user data
      try {
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const adminUser = members.find(m => m.role === 'ADMIN');
        
        if (adminUser) {
          console.log('Using mock admin user:', adminUser);
          setCurrentUser(adminUser);
        } else {
          // Clear token if no mock user found
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (mockErr) {
        console.error('Error getting mock user:', mockErr);
        // Clear token if it's invalid
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      const { accessToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', accessToken);
      
      // Set the default Authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Set current user directly from response if available
      if (user) {
        setCurrentUser(user);
      } else {
        // Fetch current user info if user not included in response
        await fetchCurrentUser();
      }
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      
      if (!navigator.onLine) {
        setError('You are offline. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.register(userData);
      
      // After successful registration, redirect to login page
      // The user will need to log in with their credentials
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      
      if (!navigator.onLine) {
        setError('You are offline. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to register. Please try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setCurrentUser(null);
    setError(null);
  };

  const isAdmin = () => {
    console.log('isAdmin check - currentUser:', currentUser);
    const result = currentUser && currentUser.role === 'ADMIN';
    console.log('isAdmin result:', result);
    return result;
  };

  const value = {
    currentUser,
    loading,
    error,
    isOfflineMode,
    login,
    register,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 