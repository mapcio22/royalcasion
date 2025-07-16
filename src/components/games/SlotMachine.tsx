
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Coins } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SlotMachineProps {
  onBack: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [slots, setSlots] = useState(['🍒', '🍋', '🍊']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐'];
  const spinCost = 100;

  const spin = async () => {
    if (!user || user.balance < spinCost) {
      toast({ title: "Błąd", description: "Niewystarczające środki!", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setLastWin(null);

    // Update balance immediately
    updateBalance(user.balance - spinCost);

    // Spinning animation
    const spinInterval = setInterval(() => {
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    // Stop spinning after 2 seconds
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Final result
      const finalSlots = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      setSlots(finalSlots);
      setIsSpinning(false);

      // Check for win
      if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
        const winAmount = spinCost * 5;
        setLastWin(winAmount);
        updateBalance((user.balance - spinCost) + winAmount);
        toast({ 
          title: "🎉 JACKPOT!", 
          description: `Wygrałeś ${winAmount} PLN!`,
          className: "bg-green-900 border-green-600"
        });
      } else {
        toast({ 
          title: "Spróbuj ponownie", 
          description: "Tym razem się nie udało. Powodzenia następnym razem!",
          variant: "destructive"
        });
      }
    }, 2000);
  };

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
          {/* Slot Machine */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">🎰 Jednoręki Bandyta</CardTitle>
              <CardDescription className="text-gray-300">
                Dopasuj 3 takie same symbole i wygraj x5!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Slot Display */}
              <div className="bg-black rounded-lg p-8 border-4 border-yellow-500">
                <div className="flex justify-center space-x-4">
                  {slots.map((symbol, index) => (
                    <div
                      key={index}
                      className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-6xl border-4 border-gray-300 ${
                        isSpinning ? 'animate-pulse' : ''
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span>Koszt zakręcenia:</span>
                  <span className="font-bold text-yellow-500">{spinCost} PLN</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Wygrana za 3 takie same:</span>
                  <span className="font-bold text-green-500">{spinCost * 5} PLN</span>
                </div>
                {lastWin && (
                  <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 text-center">
                    <div className="text-green-400 text-2xl font-bold">
                      🎉 Wygrałeś {lastWin} PLN!
                    </div>
                  </div>
                )}
              </div>

              {/* Spin Button */}
              <Button
                onClick={spin}
                disabled={isSpinning || !user || user.balance < spinCost}
                className="w-full h-16 text-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
              >
                {isSpinning ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Kręci się...
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-2" />
                    ZAKREĆ ({spinCost} PLN)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                  Twoje saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{user?.balance?.toFixed(2)} PLN</div>
                <p className="text-gray-400 text-sm mt-1">
                  {user && user.balance >= spinCost 
                    ? `Możesz zagrać jeszcze ${Math.floor(user.balance / spinCost)} razy`
                    : 'Niewystarczające środki'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zasady gry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Koszt jednego zakręcenia: <strong>{spinCost} PLN</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>3 takie same symbole = wygrana <strong>x5</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Możliwa wygrana: <strong>{spinCost * 5} PLN</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">⚠</span>
                  <span>Gra losowa - nie ma gwarancji wygranej</span>
                </div>
              </CardContent>
            </Card>

            {/* Symbols */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Symbole</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {symbols.map((symbol, index) => (
                    <div key={index} className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-3xl">{symbol}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
