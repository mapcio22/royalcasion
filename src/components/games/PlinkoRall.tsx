import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PlinkoBallProps {
  onBack: () => void;
}

const PlinkoBall: React.FC<PlinkoBallProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [rows, setRows] = useState(8);
  const [isDropping, setIsDropping] = useState(false);
  const [ballPosition, setBallPosition] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const animationRef = useRef<number>();

  // Multipliers based on risk level and rows
  const getMultipliers = () => {
    const multipliers = {
      low: {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
        16: [16, 9, 2, 1.4, 1.2, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 1.2, 1.4, 2, 9, 16]
      },
      medium: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
      },
      high: {
        8: [29, 4, 1.5, 0.4, 0.2, 0.4, 1.5, 4, 29],
        12: [76, 18, 5, 1.9, 0.4, 0.2, 0.1, 0.2, 0.4, 1.9, 5, 18, 76],
        16: [420, 130, 26, 9, 4, 2, 0.2, 0.2, 0.1, 0.2, 0.2, 2, 4, 9, 26, 130, 420]
      }
    };
    return multipliers[risk][rows as keyof typeof multipliers[typeof risk]];
  };

  const dropBall = () => {
    if (bet > user!.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsDropping(true);
    
    // Simulate ball path
    let currentPosition = Math.floor(getMultipliers().length / 2);
    let path = [currentPosition];
    
    for (let i = 0; i < rows; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      currentPosition = Math.max(0, Math.min(getMultipliers().length - 1, currentPosition + direction));
      path.push(currentPosition);
    }

    // Animate ball drop
    let step = 0;
    const animate = () => {
      if (step < path.length) {
        setBallPosition(path[step]);
        step++;
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(animate, 200);
        });
      } else {
        // Calculate winnings
        const finalPosition = path[path.length - 1];
        const multiplier = getMultipliers()[finalPosition];
        const winAmount = bet * multiplier;
        const profit = winAmount - bet;
        
        setLastWin(winAmount);
        updateBalance(user!.balance + profit);
        setIsDropping(false);
        
        if (profit > 0) {
          toast({
            title: "Winner!",
            description: `You won ${winAmount} chips! (${multiplier}x multiplier)`,
          });
        } else {
          toast({
            title: "Try again",
            description: `You won ${winAmount} chips. Better luck next time!`,
            variant: "destructive",
          });
        }
      }
    };
    
    animate();
  };

  const renderPlinkoBoard = () => {
    const multipliers = getMultipliers();
    
    return (
      <div className="relative bg-gray-900 rounded-lg p-4 mx-auto" style={{ width: '600px', height: '400px' }}>
        {/* Pegs */}
        <div className="absolute inset-0">
          {Array.from({ length: rows + 1 }).map((_, row) => (
            <div key={row} className="flex justify-center" style={{ top: `${(row * 340) / rows + 20}px`, position: 'absolute', width: '100%' }}>
              {Array.from({ length: row + 3 }).map((_, col) => (
                <div
                  key={col}
                  className="w-3 h-3 bg-white rounded-full mx-2"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Ball */}
        {isDropping && (
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full transition-all duration-200 z-10"
            style={{
              left: `${ballPosition * 40 + 280}px`,
              top: '10px'
            }}
          />
        )}

        {/* Multiplier slots */}
        <div className="absolute bottom-0 flex justify-center w-full">
          {multipliers.map((multiplier, index) => (
            <div
              key={index}
              className={`w-12 h-12 border border-white flex items-center justify-center text-xs text-white font-bold mx-1 ${
                multiplier >= 10 ? 'bg-red-600' : multiplier >= 2 ? 'bg-yellow-600' : 'bg-gray-600'
              }`}
            >
              {multiplier}x
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Games
          </Button>
          <h1 className="text-4xl font-bold text-white">Plinko Ball</h1>
          <div className="text-right text-white">
            <p className="text-lg">Balance: {user?.balance} chips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-center">Plinko Board</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPlinkoBoard()}
                {lastWin > 0 && (
                  <div className="text-center mt-4">
                    <div className="text-2xl font-bold text-yellow-400">
                      Last Win: {lastWin} chips
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Game Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Bet Amount:</label>
                  <Input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-gray-700 text-white border-gray-600"
                    disabled={isDropping}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Risk Level:</label>
                  <div className="space-y-2">
                    {(['low', 'medium', 'high'] as const).map((riskLevel) => (
                      <Button
                        key={riskLevel}
                        onClick={() => setRisk(riskLevel)}
                        variant={risk === riskLevel ? 'default' : 'outline'}
                        className="w-full capitalize"
                        disabled={isDropping}
                      >
                        {riskLevel}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Rows:</label>
                  <div className="space-y-2">
                    {[8, 12, 16].map((rowCount) => (
                      <Button
                        key={rowCount}
                        onClick={() => setRows(rowCount)}
                        variant={rows === rowCount ? 'default' : 'outline'}
                        className="w-full"
                        disabled={isDropping}
                      >
                        {rowCount} Rows
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={dropBall} 
                  className="w-full" 
                  size="lg"
                  disabled={isDropping}
                >
                  {isDropping ? 'Dropping...' : 'Drop Ball'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-white text-sm space-y-2">
                <p>• Drop a ball from the top</p>
                <p>• Ball bounces off pegs randomly</p>
                <p>• Land in different slots for multipliers</p>
                <p>• Higher risk = higher potential rewards</p>
                <p>• More rows = more randomness</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoBall;