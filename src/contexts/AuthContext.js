// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call
      const usersData = require('../data/users.json');
      const user = usersData.users.find(u => 
        u.email === email && u.password === password // In real app, use proper password hashing
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Remove password from stored user data
      const { password: _, ...userWithoutPassword } = user;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      // In a real app, this would be an API call
      const usersData = require('../data/users.json');
      
      // Check if email already exists
      if (usersData.users.some(u => u.email === userData.email)) {
        throw new Error('Email already exists');
      }

      // Create new user
      const newUser = {
        id: usersData.users.length + 1,
        ...userData,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      // In a real app, we would save this to a database
      usersData.users.push(newUser);
      
      // Remove password from stored user data
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
