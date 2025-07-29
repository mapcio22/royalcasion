
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

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown';
    }
  };

  useEffect(() => {
    // Load saved user on app start based on IP
    const loadUserByIP = async () => {
      try {
        const userIP = await getUserIP();
        const savedUser = localStorage.getItem(`casino_user_${userIP}`);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
      }
    };
    
    loadUserByIP();
  }, []);

  const saveUser = async (userData: User) => {
    setUser(userData);
    
    try {
      const userIP = await getUserIP();
      localStorage.setItem(`casino_user_${userIP}`, JSON.stringify(userData));
      
      // Update users list with IP-based saving
      const users = JSON.parse(localStorage.getItem('casino_users') || '[]');
      const existingUserIndex = users.findIndex((u: User & { ip: string }) => u.ip === userIP);
      
      const userDataWithIP = { ...userData, ip: userIP };
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = userDataWithIP;
      } else {
        users.push(userDataWithIP);
      }
      
      localStorage.setItem('casino_users', JSON.stringify(users));
      console.log('User saved permanently for IP:', userIP, userData.username);
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
        await saveUser(userData);
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
      await saveUser(userData);
      console.log('User registered successfully:', username);
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const userIP = await getUserIP();
      setUser(null);
      localStorage.removeItem(`casino_user_${userIP}`);
      console.log('User logged out for IP:', userIP);
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
    }
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
