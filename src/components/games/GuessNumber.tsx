
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Hash, Coins } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface GuessNumberProps {
  onBack: () => void;
}

const GuessNumber: React.FC<GuessNumberProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [bet, setBet] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const playGame = () => {
    const betAmount = parseFloat(bet);
    
    if (selectedNumber === null || !betAmount || betAmount <= 0) {
      toast({ title: "Błąd", description: "Wybierz liczbę i wprowadź stawkę!", variant: "destructive" });
      return;
    }

    if (!user || user.balance < betAmount) {
      toast({ title: "Błąd", description: "Niewystarczające środki!", variant: "destructive" });
      return;
    }

    setIsPlaying(true);
    setLastWin(null);

    // Update balance immediately
    updateBalance(user.balance - betAmount);

    // Generate random number after delay
    setTimeout(() => {
      const result = Math.floor(Math.random() * 10) + 1; // 1-10
      setLastResult(result);
      setIsPlaying(false);

      if (result === selectedNumber) {
        const winAmount = betAmount * 10;
        setLastWin(winAmount);
        updateBalance((user.balance - betAmount) + winAmount);
        toast({ 
          title: "🎉 BRAWO!", 
          description: `Zgadłeś! Wygrałeś ${winAmount.toFixed(2)} PLN!`,
          className: "bg-green-900 border-green-600"
        });
      } else {
        toast({ 
          title: "Spróbuj ponownie", 
          description: `Wylosowana liczba to ${result}. Następnym razem się uda!`,
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do panelu
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Area */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">🔢 Zgadnij Liczbę</CardTitle>
              <CardDescription className="text-gray-300">
                Zgadnij liczbę od 1 do 10 i wygraj x10!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Number Selection */}
              <div className="space-y-3">
                <Label className="text-white text-lg">Wybierz liczbę (1-10)</Label>
                <div className="grid grid-cols-5 gap-3">
                  {numbers.map((num) => (
                    <Button
                      key={num}
                      onClick={() => setSelectedNumber(num)}
                      variant={selectedNumber === num ? "default" : "outline"}
                      className={`aspect-square text-lg font-bold ${
                        selectedNumber === num 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                          : 'border-gray-600 text-white hover:bg-gray-800'
                      }`}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Game Display */}
              <div className="bg-black rounded-lg p-8 border-4 border-blue-500 text-center">
                {isPlaying ? (
                  <div className="space-y-4">
                    <div className="text-4xl animate-bounce">🎲</div>
                    <div className="text-white text-xl">Losuję liczbę...</div>
                  </div>
                ) : lastResult !== null ? (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-yellow-500">{lastResult}</div>
                    <div className="text-white text-lg">Wylosowana liczba</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">❓</div>
                    <div className="text-white text-lg">Wybierz liczbę i zagraj!</div>
                  </div>
                )}
              </div>

              {/* Results */}
              {lastWin && (
                <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 text-center">
                  <div className="text-green-400 text-2xl font-bold">
                    🎉 Wygrałeś {lastWin.toFixed(2)} PLN!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                  Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{user?.balance?.toFixed(2)} PLN</div>
              </CardContent>
            </Card>

            {/* Betting Form */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Twój zakład</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Wybrana liczba</Label>
                  <div className="text-3xl font-bold text-yellow-500 text-center p-4 bg-gray-800 rounded">
                    {selectedNumber !== null ? selectedNumber : '-'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bet" className="text-white">Stawka (PLN)</Label>
                  <Input
                    id="bet"
                    type="number"
                    min="1"
                    step="0.01"
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-xl h-12"
                    placeholder="Wprowadź stawkę"
                  />
                </div>

                {bet && selectedNumber !== null && (
                  <div className="p-3 bg-blue-900/50 border border-blue-600 rounded text-blue-300">
                    <div className="text-sm">Możliwa wygrana:</div>
                    <div className="text-xl font-bold">{(parseFloat(bet || '0') * 10).toFixed(2)} PLN</div>
                  </div>
                )}

                <Button
                  onClick={playGame}
                  disabled={isPlaying || selectedNumber === null || !bet || parseFloat(bet) <= 0}
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
                >
                  {isPlaying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Losuję...
                    </>
                  ) : (
                    <>
                      <Hash className="h-5 w-5 mr-2" />
                      ZAGRAJ
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zasady gry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Wybierz liczbę od 1 do 10</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Wprowadź stawkę</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Trafienie = wygrana <strong>x10</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">⚠</span>
                  <span>Szansa na wygraną: 10%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessNumber;
