
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  balance: number;
  lastFreeCoins?: number;
}

interface AuthContextType {
  user: User | null;
  updateBalance: (newBalance: number) => void;
  deposit: (amount: number) => void;
  claimFreeCoins: () => boolean;
  timeUntilNextClaim: number;
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
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);

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
    // Auto-create user on app start based on IP
    const loadOrCreateUser = async () => {
      try {
        const userIP = await getUserIP();
        const savedUser = localStorage.getItem(`casino_user_${userIP}`);
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } else {
          // Create new user automatically
          const newUser: User = {
            id: Date.now().toString(),
            username: `Gracz_${userIP.slice(-4)}`,
            balance: 1000,
            lastFreeCoins: Date.now()
          };
          await saveUser(newUser);
        }
      } catch (error) {
        console.error('Error loading/creating user:', error);
      }
    };
    
    loadOrCreateUser();
  }, []);

  // Timer for free coins countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.lastFreeCoins) {
        const timePassed = Date.now() - user.lastFreeCoins;
        const timeLeft = Math.max(0, 180000 - timePassed); // 3 minutes = 180000ms
        setTimeUntilNextClaim(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.lastFreeCoins]);

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

  const claimFreeCoins = (): boolean => {
    if (!user) return false;
    
    const timeSinceLastClaim = Date.now() - (user.lastFreeCoins || 0);
    
    if (timeSinceLastClaim >= 180000) { // 3 minutes
      const updatedUser = {
        ...user,
        balance: user.balance + 500,
        lastFreeCoins: Date.now()
      };
      saveUser(updatedUser);
      return true;
    }
    
    return false;
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
    <AuthContext.Provider value={{ user, updateBalance, deposit, claimFreeCoins, timeUntilNextClaim }}>
      {children}
    </AuthContext.Provider>
  );
};
