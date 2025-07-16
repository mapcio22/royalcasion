
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  deposit: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load saved user on app start
    const savedUser = localStorage.getItem('casino_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('casino_user');
      }
    }
  }, []);

  const saveUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('casino_user', JSON.stringify(userData));
    
    // Update users list with permanent saving
    try {
      const users = JSON.parse(localStorage.getItem('casino_users') || '[]');
      const existingUserIndex = users.findIndex((u: User) => u.id === userData.id);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = userData;
      } else {
        users.push(userData);
      }
      
      localStorage.setItem('casino_users', JSON.stringify(users));
      console.log('User saved permanently:', userData.username);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('casino_users') || '[]');
      const foundUser = users.find((u: any) => u.username === username && u.password === password);
      
      if (foundUser) {
        const userData = { id: foundUser.id, username: foundUser.username, balance: foundUser.balance };
        saveUser(userData);
        console.log('User logged in successfully:', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('casino_users') || '[]');
      const existingUser = users.find((u: any) => u.username === username);
      
      if (existingUser) {
        return false; // User already exists
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        balance: 1000 // Starting balance
      };

      users.push(newUser);
      localStorage.setItem('casino_users', JSON.stringify(users));
      
      const userData = { id: newUser.id, username: newUser.username, balance: newUser.balance };
      saveUser(userData);
      console.log('User registered successfully:', username);
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('casino_user');
    console.log('User logged out');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      saveUser(updatedUser);
    }
  };

  const deposit = (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      updateBalance(newBalance);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBalance, deposit }}>
      {children}
    </AuthContext.Provider>
  );
};
