
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Bomb, Coins, Shield, Gem } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface MinesProps {
  onBack: () => void;
}

interface Cell {
  revealed: boolean;
  isMine: boolean;
  isSafe: boolean;
}

const Mines: React.FC<MinesProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [mineCount, setMineCount] = useState('1');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [revealedSafeCells, setRevealedSafeCells] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  
  const gridSize = 36; // 6x6 grid

  const getBaseMultiplier = (mines: number): number => {
    switch (mines) {
      case 1: return 1.05;
      case 2: return 1.10;
      case 3: return 1.15;
      default: return 1.05;
    }
  };

  const calculateMultiplier = (safeCellsRevealed: number, totalMines: number): number => {
    const baseMultiplier = getBaseMultiplier(totalMines);
    const totalSafeCells = gridSize - totalMines;
    const progress = safeCellsRevealed / totalSafeCells;
    
    // Progressive multiplier that increases with each safe cell revealed
    return 1 + (baseMultiplier - 1) * (1 + progress * 2);
  };

  const startGame = () => {
    const betAmount = parseFloat(bet);
    const mines = parseInt(mineCount);
    
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
    const newGrid: Cell[] = Array(gridSize).fill(null).map(() => ({
      revealed: false,
      isMine: false,
      isSafe: false
    }));

    // Place mines randomly
    const minePos: number[] = [];
    while (minePos.length < mines) {
      const pos = Math.floor(Math.random() * gridSize);
      if (!minePos.includes(pos)) {
        minePos.push(pos);
        newGrid[pos].isMine = true;
      }
    }

    setMinePositions(minePos);
    setGrid(newGrid);
    setGameStarted(true);
    setGameOver(false);
    setWon(false);
    setRevealedSafeCells(0);
    setCurrentMultiplier(1);

    toast({ 
      title: "Gra rozpoczęta!", 
      description: `Unikaj ${mines} min na siatce 6x6. Możesz wypłacić się w każdej chwili!` 
    });
  };

  const revealCell = (index: number) => {
    if (!gameStarted || gameOver || grid[index].revealed) return;

    const newGrid = [...grid];
    newGrid[index].revealed = true;

    if (newGrid[index].isMine) {
      // Hit a mine - game over
      minePositions.forEach(pos => {
        newGrid[pos].revealed = true;
      });
      setGrid(newGrid);
      setGameOver(true);
      setWon(false);
      
      toast({ 
        title: "💥 BOOM!", 
        description: "Trafiłeś na minę! Straciłeś swoją stawkę.",
        variant: "destructive"
      });
    } else {
      // Safe cell - continue game
      newGrid[index].isSafe = true;
      const newRevealedSafeCells = revealedSafeCells + 1;
      const newMultiplier = calculateMultiplier(newRevealedSafeCells, parseInt(mineCount));
      
      setGrid(newGrid);
      setRevealedSafeCells(newRevealedSafeCells);
      setCurrentMultiplier(newMultiplier);
      
      // Check if all safe cells are revealed (perfect game)
      const totalSafeCells = gridSize - parseInt(mineCount);
      if (newRevealedSafeCells === totalSafeCells) {
        setGameOver(true);
        setWon(true);
        
        const betAmount = parseFloat(bet);
        const winAmount = betAmount * newMultiplier;
        updateBalance(user!.balance + winAmount);
        
        toast({ 
          title: "🎉 PERFEKCYJNA GRA!", 
          description: `Odkryłeś wszystkie bezpieczne pola! Wygrałeś ${winAmount.toFixed(2)} PLN!`,
          className: "bg-green-900 border-green-600"
        });
      } else {
        toast({ 
          title: "✅ Bezpieczne!", 
          description: `Mnożnik: x${newMultiplier.toFixed(2)}`,
          className: "bg-blue-900 border-blue-600"
        });
      }
    }
  };

  const cashOut = () => {
    if (!gameStarted || gameOver || revealedSafeCells === 0) return;

    const betAmount = parseFloat(bet);
    const winAmount = betAmount * currentMultiplier;
    
    setGameOver(true);
    setWon(true);
    
    updateBalance(user!.balance + winAmount);
    
    toast({ 
      title: "💰 WYPŁATA!", 
      description: `Wygrałeś ${winAmount.toFixed(2)} PLN z mnożnikiem x${currentMultiplier.toFixed(2)}!`,
      className: "bg-green-900 border-green-600"
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWon(false);
    setGrid([]);
    setMinePositions([]);
    setRevealedSafeCells(0);
    setCurrentMultiplier(1);
    setBet('');
  };

  const getPotentialWin = () => {
    const betAmount = parseFloat(bet || '0');
    return betAmount * currentMultiplier;
  };

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
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white">💣 Miny</CardTitle>
                <CardDescription className="text-gray-300">
                  Siatka 6x6 - unikaj min i wypłać się w odpowiednim momencie!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Stats */}
                {gameStarted && !gameOver && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Odkryte</div>
                      <div className="text-white font-bold">{revealedSafeCells}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Mnożnik</div>
                      <div className="text-yellow-400 font-bold">x{currentMultiplier.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Potencjalna wygrana</div>
                      <div className="text-green-400 font-bold">{getPotentialWin().toFixed(2)} PLN</div>
                    </div>
                  </div>
                )}

                {/* Game Grid */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {grid.map((cell, index) => (
                      <button
                        key={index}
                        onClick={() => revealCell(index)}
                        disabled={!gameStarted || gameOver || cell.revealed}
                        className={`aspect-square text-2xl font-bold rounded border-2 transition-all ${
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
                        {cell.revealed && cell.isSafe && '💎'}
                        {!cell.revealed && gameStarted && '❓'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Out Button */}
                {gameStarted && !gameOver && revealedSafeCells > 0 && (
                  <div className="text-center">
                    <Button
                      onClick={cashOut}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 text-lg"
                    >
                      <Coins className="h-5 w-5 mr-2" />
                      WYPŁAĆ {getPotentialWin().toFixed(2)} PLN
                    </Button>
                  </div>
                )}

                {/* Game Status */}
                <div className="text-center space-y-4">
                  {!gameStarted && !gameOver && (
                    <div className="text-gray-300 text-lg">
                      Ustaw parametry gry i rozpocznij!
                    </div>
                  )}
                  
                  {gameStarted && !gameOver && (
                    <div className="text-yellow-400 text-lg animate-pulse">
                      Wybierz pole lub wypłać się...
                    </div>
                  )}
                  
                  {gameOver && (
                    <div className="space-y-4">
                      {won ? (
                        <div className="text-green-400 text-2xl font-bold">
                          🎉 Wygrałeś {getPotentialWin().toFixed(2)} PLN!
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
          </div>

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

            {/* Game Settings */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ustawienia gry</CardTitle>
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

                <div className="space-y-2">
                  <Label htmlFor="mines" className="text-white">Liczba min</Label>
                  <Select value={mineCount} onValueChange={setMineCount} disabled={gameStarted}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="1" className="text-white">1 mina (x1.05 baza)</SelectItem>
                      <SelectItem value="2" className="text-white">2 miny (x1.10 baza)</SelectItem>
                      <SelectItem value="3" className="text-white">3 miny (x1.15 baza)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bet && (
                  <div className="p-3 bg-blue-900/50 border border-blue-600 rounded text-blue-300">
                    <div className="text-sm">Mnożnik bazowy:</div>
                    <div className="text-xl font-bold">x{getBaseMultiplier(parseInt(mineCount)).toFixed(2)}</div>
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
                  <Gem className="h-4 w-4 text-blue-500" />
                  <span>Siatka <strong>6x6</strong> (36 pól)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bomb className="h-4 w-4 text-red-500" />
                  <span>Wybierz liczbę min: <strong>1-3</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Mnożnik rośnie z każdym odkryciem</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>Wypłać się <strong>w każdej chwili</strong></span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-3">
                  <div className="text-xs text-gray-400">Mnożniki bazowe:</div>
                  <div className="text-xs">1 mina: x1.05 | 2 miny: x1.10 | 3 miny: x1.15</div>
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
