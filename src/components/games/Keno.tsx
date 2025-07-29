import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../AuthContext';
import { useToast } from '@/hooks/use-toast';

interface KenoProps {
  onBack: () => void;
}

const Keno: React.FC<KenoProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [bet, setBet] = useState(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [matches, setMatches] = useState(0);
  const [winAmount, setWinAmount] = useState(0);

  // Keno payout table based on spots selected and matches
  const getPayoutMultiplier = (spots: number, hits: number): number => {
    const payoutTable: { [key: number]: { [key: number]: number } } = {
      1: { 1: 3 },
      2: { 2: 12 },
      3: { 2: 1, 3: 42 },
      4: { 2: 1, 3: 4, 4: 120 },
      5: { 3: 1, 4: 12, 5: 750 },
      6: { 3: 1, 4: 3, 5: 75, 6: 1500 },
      7: { 4: 1, 5: 20, 6: 400, 7: 7500 },
      8: { 5: 10, 6: 80, 7: 1000, 8: 10000 },
      9: { 5: 5, 6: 25, 7: 200, 8: 4000, 9: 10000 },
      10: { 5: 2, 6: 10, 7: 50, 8: 500, 9: 2000, 10: 10000 }
    };

    return payoutTable[spots]?.[hits] || 0;
  };

  const toggleNumber = (number: number) => {
    if (gameStarted && !gameOver) return;
    
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const startGame = () => {
    if (selectedNumbers.length === 0) {
      toast({
        title: "Select numbers",
        description: "Please select at least 1 number to play.",
        variant: "destructive",
      });
      return;
    }

    if (bet > user!.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    setDrawnNumbers([]);
    setMatches(0);
    setWinAmount(0);

    // Draw 20 random numbers
    const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
    const drawn: number[] = [];
    
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      drawn.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1);
    }

    setDrawnNumbers(drawn);

    // Calculate matches and winnings
    setTimeout(() => {
      const matchingNumbers = selectedNumbers.filter(num => drawn.includes(num));
      const matchCount = matchingNumbers.length;
      const multiplier = getPayoutMultiplier(selectedNumbers.length, matchCount);
      const totalWin = bet * multiplier;
      
      setMatches(matchCount);
      setWinAmount(totalWin);
      setGameOver(true);

      const profit = totalWin - bet;
      updateBalance(user!.balance + profit);

      if (profit > 0) {
        toast({
          title: "Congratulations!",
          description: `You won ${totalWin} chips with ${matchCount} matches!`,
        });
      } else {
        toast({
          title: "Better luck next time",
          description: `You matched ${matchCount} numbers. Try again!`,
          variant: "destructive",
        });
      }
    }, 3000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setDrawnNumbers([]);
    setMatches(0);
    setWinAmount(0);
  };

  const quickPick = () => {
    if (gameStarted && !gameOver) return;
    
    const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
    const picked: number[] = [];
    
    for (let i = 0; i < Math.min(10, Math.floor(Math.random() * 10) + 1); i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      picked.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1);
    }
    
    setSelectedNumbers(picked);
  };

  const clearSelection = () => {
    if (gameStarted && !gameOver) return;
    setSelectedNumbers([]);
  };

  const renderNumberGrid = () => {
    return (
      <div className="grid grid-cols-10 gap-2 p-4">
        {Array.from({ length: 80 }, (_, i) => i + 1).map(number => {
          const isSelected = selectedNumbers.includes(number);
          const isDrawn = drawnNumbers.includes(number);
          const isMatch = isSelected && isDrawn;
          
          let className = "w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-bold cursor-pointer transition-all ";
          
          if (isMatch) {
            className += "bg-green-500 border-green-400 text-white";
          } else if (isSelected) {
            className += "bg-blue-500 border-blue-400 text-white";
          } else if (isDrawn && gameOver) {
            className += "bg-red-400 border-red-300 text-white";
          } else {
            className += "bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300";
          }

          return (
            <div
              key={number}
              className={className}
              onClick={() => toggleNumber(number)}
            >
              {number}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Games
          </Button>
          <h1 className="text-4xl font-bold text-white">Keno</h1>
          <div className="text-right text-white">
            <p className="text-lg">Balance: {user?.balance} chips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Keno Board
                  {gameOver && (
                    <div className="text-yellow-400 text-lg mt-2">
                      {matches} matches • Won: {winAmount} chips
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderNumberGrid()}
                
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-center text-white text-sm">
                    <div>
                      <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                      <div>Your Pick</div>
                    </div>
                    <div>
                      <div className="w-4 h-4 bg-red-400 rounded mx-auto mb-1"></div>
                      <div>Drawn</div>
                    </div>
                    <div>
                      <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
                      <div>Match</div>
                    </div>
                    <div>
                      <div className="w-4 h-4 bg-gray-200 rounded mx-auto mb-1"></div>
                      <div>Not Selected</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Game Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Bet Amount:</label>
                  <Input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-gray-700 text-white border-gray-600"
                    disabled={gameStarted && !gameOver}
                  />
                </div>

                <div className="text-white">
                  <div>Selected: {selectedNumbers.length}/10</div>
                  {gameStarted && !gameOver && (
                    <div className="text-yellow-400">Drawing numbers...</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={quickPick} 
                    variant="outline" 
                    className="w-full"
                    disabled={gameStarted && !gameOver}
                  >
                    Quick Pick
                  </Button>
                  
                  <Button 
                    onClick={clearSelection} 
                    variant="outline" 
                    className="w-full"
                    disabled={gameStarted && !gameOver}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-2">
                  {!gameStarted || gameOver ? (
                    <Button onClick={startGame} className="w-full" size="lg">
                      Play Keno
                    </Button>
                  ) : (
                    <div className="text-center text-white">
                      Drawing numbers...
                    </div>
                  )}
                  
                  {gameOver && (
                    <Button onClick={resetGame} variant="outline" className="w-full">
                      New Game
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Payouts</CardTitle>
              </CardHeader>
              <CardContent className="text-white text-xs">
                <div className="space-y-1">
                  <div>1 spot: 1 hit = 3x</div>
                  <div>2 spots: 2 hits = 12x</div>
                  <div>3 spots: 2=1x, 3=42x</div>
                  <div>4 spots: 2=1x, 3=4x, 4=120x</div>
                  <div>5 spots: 3=1x, 4=12x, 5=750x</div>
                  <div>6+ spots: Higher payouts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-white text-sm space-y-2">
                <p>• Select 1-10 numbers</p>
                <p>• 20 numbers will be drawn</p>
                <p>• Win based on matches</p>
                <p>• More matches = bigger payouts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keno;