
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../components/AuthContext';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import DepositForm from '../components/DepositForm';
import SlotMachine from '../components/games/SlotMachine';
import Roulette from '../components/games/Roulette';
import Blackjack from '../components/games/Blackjack';
import GuessNumber from '../components/games/GuessNumber';
import Mines from '../components/games/Mines';
import { Toaster } from "@/components/ui/toaster";

const CasinoApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'deposit':
        return <DepositForm onBack={() => setCurrentPage('dashboard')} />;
      case 'slot':
        return <SlotMachine onBack={() => setCurrentPage('dashboard')} />;
      case 'roulette':
        return <Roulette onBack={() => setCurrentPage('dashboard')} />;
      case 'blackjack':
        return <Blackjack onBack={() => setCurrentPage('dashboard')} />;
      case 'guess':
        return <GuessNumber onBack={() => setCurrentPage('dashboard')} />;
      case 'mines':
        return <Mines onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
      <Toaster />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <CasinoApp />
    </AuthProvider>
  );
};

export default Index;
