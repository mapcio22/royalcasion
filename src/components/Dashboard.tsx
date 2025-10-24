
import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Gift, Gamepad2, BookOpen, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, claimFreeCoins, timeUntilNextClaim } = useAuth();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClaimCoins = () => {
    const success = claimFreeCoins();
    if (success) {
      toast({
        title: "Darmowe żetony!",
        description: "Otrzymałeś 500 PLN!",
      });
    } else {
      toast({
        title: "Zbyt wcześnie",
        description: `Następne darmowe żetony za ${formatTime(timeUntilNextClaim)}`,
        variant: "destructive"
      });
    }
  };

  const games = [
    { id: 'slot', name: '🎰 Jednoręki Bandyta', description: 'Klasyczny slot z symbolami emoji', cost: '100 PLN' },
    { id: 'roulette', name: '🎯 Ruletka', description: 'Obstawiaj liczby i kolory', cost: 'Dowolna stawka' },
    { id: 'blackjack', name: '🃏 Blackjack', description: 'Zbierz 21 punktów', cost: 'Dowolna stawka' },
    { id: 'guess', name: '🔢 Zgadnij Liczbę', description: 'Zgadnij liczbę od 1 do 10', cost: 'Dowolna stawka' },
    { id: 'mines', name: '💣 Miny', description: 'Unikaj min na siatce 6x6', cost: 'Dowolna stawka' },
    { id: 'poker', name: '🃏 Texas Poker', description: 'Klasyczny Texas Hold\'em', cost: 'Dowolna stawka' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-white">🎰 Royal Casino</h1>
            <Badge className="bg-gold-500 text-black px-3 py-1">
              Witaj, {user?.username}!
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4 flex items-center space-x-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold text-white">{user?.balance?.toFixed(2)} PLN</span>
              </CardContent>
            </Card>
            <Button
              onClick={() => onNavigate('gameinfo')}
              className="bg-black text-white hover:bg-gray-800 border border-gray-600"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Zasady Gier
            </Button>
            <Button
              onClick={() => onNavigate('deposit')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Wpłać
            </Button>
            <Button
              onClick={handleClaimCoins}
              disabled={timeUntilNextClaim > 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {timeUntilNextClaim > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(timeUntilNextClaim)}
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Odbierz 500 PLN
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white text-xl">{game.name}</CardTitle>
                <CardDescription className="text-gray-300">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="text-sm text-gray-400">
                    Koszt: <span className="text-yellow-500 font-semibold">{game.cost}</span>
                  </div>
                  <Button
                    onClick={() => onNavigate(game.id)}
                    className="w-full bg-black text-white hover:bg-gray-800 border border-gray-600"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Graj teraz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{user?.balance?.toFixed(2)} PLN</div>
              <p className="text-gray-400 text-sm mt-1">Dostępne środki</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gamepad2 className="h-5 w-5 mr-2 text-purple-500" />
                Gry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{games.length}</div>
              <p className="text-gray-400 text-sm mt-1">Dostępne gry</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-500">Aktywny</div>
              <p className="text-gray-400 text-sm mt-1">Konto gracza</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
