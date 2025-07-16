
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bomb, Coins, Shield } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface MinesProps {
  onBack: () => void;
}

const Mines: React.FC<MinesProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [grid, setGrid] = useState<Array<{ revealed: boolean; isMine: boolean; isSafe: boolean }>>([]);
  const [minePosition, setMinePosition] = useState<number | null>(null);
  
  const gridSize = 9; // 3x3 grid

  const startGame = () => {
    const betAmount = parseFloat(bet);
    
    if (!betAmount || betAmount <= 0) {
      toast({ title: "Błąd", description: "Wprowadź prawidłową stawkę!", variant: "destructive" });
      return;
    }

    if (!user || user.balance < betAmount) {
      toast({ title: "Błąd", description: "Niewystarczające środki!", variant: "destructive" });
      return;
    }

    // Update balance immediately
    updateBalance(user.balance - betAmount);

    // Initialize grid
    const newGrid = Array(gridSize).fill(null).map(() => ({
      revealed: false,
      isMine: false,
      isSafe: false
    }));

    // Place one mine randomly
    const minePos = Math.floor(Math.random() * gridSize);
    newGrid[minePos].isMine = true;
    setMinePosition(minePos);

    setGrid(newGrid);
    setGameStarted(true);
    setGameOver(false);
    setWon(false);

    toast({ 
      title: "Gra rozpoczęta!", 
      description: "Kliknij na pole, które według Ciebie jest bezpieczne!" 
    });
  };

  const revealCell = (index: number) => {
    if (!gameStarted || gameOver || grid[index].revealed) return;

    const newGrid = [...grid];
    newGrid[index].revealed = true;

    if (newGrid[index].isMine) {
      // Hit a mine - game over
      newGrid.forEach((cell, i) => {
        cell.revealed = true;
      });
      setGrid(newGrid);
      setGameOver(true);
      setWon(false);
      
      toast({ 
        title: "💥 BOOM!", 
        description: "Trafiłeś na minę! Spróbuj ponownie.",
        variant: "destructive"
      });
    } else {
      // Safe cell - win!
      newGrid[index].isSafe = true;
      const betAmount = parseFloat(bet);
      const winAmount = betAmount * 2;
      
      setGrid(newGrid);
      setGameOver(true);
      setWon(true);
      
      updateBalance(user!.balance + winAmount);
      
      toast({ 
        title: "🎉 WYGRANA!", 
        description: `Bezpieczne pole! Wygrałeś ${winAmount.toFixed(2)} PLN!`,
        className: "bg-green-900 border-green-600"
      });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWon(false);
    setGrid([]);
    setMinePosition(null);
    setBet('');
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
          {/* Game Area */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">💣 Miny</CardTitle>
              <CardDescription className="text-gray-300">
                Unikaj miny na siatce 3x3 i wygraj x2!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Grid */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {grid.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => revealCell(index)}
                      disabled={!gameStarted || gameOver || cell.revealed}
                      className={`aspect-square text-4xl font-bold rounded-lg border-2 transition-all ${
                        !gameStarted 
                          ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                          : cell.revealed
                            ? cell.isMine
                              ? 'bg-red-600 border-red-400'
                              : cell.isSafe
                                ? 'bg-green-600 border-green-400'
                                : 'bg-gray-600 border-gray-500'
                            : 'bg-blue-600 border-blue-400 hover:bg-blue-500 cursor-pointer active:scale-95'
                      }`}
                    >
                      {cell.revealed && cell.isMine && '💣'}
                      {cell.revealed && cell.isSafe && '✅'}
                      {!cell.revealed && gameStarted && '❓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Status */}
              <div className="text-center space-y-4">
                {!gameStarted && !gameOver && (
                  <div className="text-gray-300 text-lg">
                    Wprowadź stawkę i rozpocznij grę!
                  </div>
                )}
                
                {gameStarted && !gameOver && (
                  <div className="text-yellow-400 text-lg animate-pulse">
                    Wybierz bezpieczne pole...
                  </div>
                )}
                
                {gameOver && (
                  <div className="space-y-4">
                    {won ? (
                      <div className="text-green-400 text-2xl font-bold">
                        🎉 Wygrałeś {(parseFloat(bet || '0') * 2).toFixed(2)} PLN!
                      </div>
                    ) : (
                      <div className="text-red-400 text-2xl font-bold">
                        💥 Trafiłeś na minę!
                      </div>
                    )}
                    <Button
                      onClick={resetGame}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Zagraj ponownie
                    </Button>
                  </div>
                )}
              </div>
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
                  <Label htmlFor="bet" className="text-white">Stawka (PLN)</Label>
                  <Input
                    id="bet"
                    type="number"
                    min="1"
                    step="0.01"
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                    disabled={gameStarted}
                    className="bg-gray-800 border-gray-600 text-white text-xl h-12"
                    placeholder="Wprowadź stawkę"
                  />
                </div>

                {bet && (
                  <div className="p-3 bg-blue-900/50 border border-blue-600 rounded text-blue-300">
                    <div className="text-sm">Możliwa wygrana:</div>
                    <div className="text-xl font-bold">{(parseFloat(bet || '0') * 2).toFixed(2)} PLN</div>
                  </div>
                )}

                {!gameStarted && (
                  <Button
                    onClick={startGame}
                    disabled={!bet || parseFloat(bet) <= 0}
                    className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
                  >
                    <Bomb className="h-5 w-5 mr-2" />
                    ROZPOCZNIJ GRĘ
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zasady gry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-center space-x-2">
                  <Bomb className="h-4 w-4 text-red-500" />
                  <span>Na siatce 3x3 jest <strong>1 mina</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span><strong>8 bezpiecznych</strong> pól</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Trafienie w bezpieczne = wygrana <strong>x2</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">✗</span>
                  <span>Trafienie w minę = przegrana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">⚠</span>
                  <span>Szansa na wygraną: ~89%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mines;
