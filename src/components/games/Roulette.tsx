
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, Coins } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface RouletteProps {
  onBack: () => void;
}

const Roulette: React.FC<RouletteProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [bet, setBet] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const spin = () => {
    const betAmount = parseFloat(bet);
    
    if (!user || !selectedNumber === null || !betAmount || betAmount <= 0) {
      toast({ title: "Błąd", description: "Wybierz liczbę i wprowadź stawkę!", variant: "destructive" });
      return;
    }

    if (user.balance < betAmount) {
      toast({ title: "Błąd", description: "Niewystarczające środki!", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setLastWin(null);

    // Update balance immediately
    updateBalance(user.balance - betAmount);

    // Spinning animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * 37); // 0-36
      setLastResult(result);
      setIsSpinning(false);

      if (result === selectedNumber) {
        const winAmount = betAmount * 36;
        setLastWin(winAmount);
        updateBalance((user.balance - betAmount) + winAmount);
        toast({ 
          title: "🎉 WYGRANA!", 
          description: `Trafiłeś! Wygrałeś ${winAmount.toFixed(2)} PLN!`,
          className: "bg-green-900 border-green-600"
        });
      } else {
        toast({ 
          title: "Spróbuj ponownie", 
          description: `Wypadło ${result}. Następnym razem się uda!`,
          variant: "destructive"
        });
      }
    }, 3000);
  };

  const numbers = Array.from({ length: 37 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do panelu
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roulette Table */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white">🎯 Ruletka</CardTitle>
                <CardDescription className="text-gray-300">
                  Wybierz liczbę od 0 do 36
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Roulette Wheel Animation */}
                <div className="bg-black rounded-full w-40 h-40 mx-auto relative border-8 border-yellow-500 flex items-center justify-center">
                  {isSpinning ? (
                    <div className="animate-spin text-6xl">🎯</div>
                  ) : (
                    <div className="text-4xl font-bold text-white">
                      {lastResult !== null ? lastResult : '?'}
                    </div>
                  )}
                </div>

                {/* Number Grid */}
                <div className="bg-green-800 p-6 rounded-lg">
                  <div className="grid grid-cols-13 gap-1 max-w-4xl">
                    {/* 0 */}
                    <button
                      onClick={() => setSelectedNumber(0)}
                      className={`aspect-square text-white font-bold rounded ${
                        selectedNumber === 0 
                          ? 'bg-yellow-500 border-2 border-yellow-300' 
                          : 'bg-green-600 hover:bg-green-500'
                      }`}
                    >
                      0
                    </button>
                    
                    {/* Empty cell for layout */}
                    <div className="col-span-12"></div>
                    
                    {/* Numbers 1-36 */}
                    {numbers.slice(1).map((num) => {
                      const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedNumber(num)}
                          className={`aspect-square text-white font-bold rounded border ${
                            selectedNumber === num 
                              ? 'border-4 border-yellow-300 scale-110' 
                              : 'border-gray-400'
                          } ${
                            isRed ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results */}
                {lastResult !== null && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl text-white">
                      Wynik: <span className="font-bold text-yellow-500">{lastResult}</span>
                    </div>
                    {lastWin && (
                      <div className="text-green-400 text-xl font-bold">
                        🎉 Wygrałeś {lastWin.toFixed(2)} PLN!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Betting Panel */}
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
                <CardTitle className="text-white">Postaw zakład</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Wybrana liczba</Label>
                  <div className="text-2xl font-bold text-yellow-500 text-center p-4 bg-gray-800 rounded">
                    {selectedNumber !== null ? selectedNumber : 'Nie wybrano'}
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
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Wprowadź stawkę"
                  />
                </div>

                {bet && selectedNumber !== null && (
                  <div className="p-3 bg-blue-900/50 border border-blue-600 rounded text-blue-300 text-sm">
                    Możliwa wygrana: <strong>{(parseFloat(bet || '0') * 36).toFixed(2)} PLN</strong>
                  </div>
                )}

                <Button
                  onClick={spin}
                  disabled={isSpinning || selectedNumber === null || !bet || parseFloat(bet) <= 0}
                  className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
                >
                  {isSpinning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Kręci się...
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5 mr-2" />
                      ZAKRĘĆ KOŁEM
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zasady</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300 text-sm">
                <div>• Wybierz liczbę od 0 do 36</div>
                <div>• Wprowadź stawkę</div>
                <div>• Trafienie = wygrana x36</div>
                <div>• Czerwone: nieparzyste (1-36)</div>
                <div>• Czarne: parzyste (2-36)</div>
                <div>• Zielone: 0</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
