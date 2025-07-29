import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BaccaratProps {
  onBack: () => void;
}

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  points: number;
}

const Baccarat: React.FC<BaccaratProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<'player' | 'banker' | 'tie'>('player');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [bankerCards, setBankerCards] = useState<PlayingCard[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [bankerScore, setBankerScore] = useState(0);
  const [winner, setWinner] = useState<string>('');

  const createDeck = (): PlayingCard[] => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: PlayingCard[] = [];

    suits.forEach(suit => {
      values.forEach(value => {
        let points = 0;
        if (value === 'A') points = 1;
        else if (['J', 'Q', 'K', '10'].includes(value)) points = 0;
        else points = parseInt(value);

        deck.push({ suit, value, points });
      });
    });

    return deck;
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateScore = (cards: PlayingCard[]): number => {
    const total = cards.reduce((sum, card) => sum + card.points, 0);
    return total % 10;
  };

  const startGame = () => {
    if (bet > user!.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    const deck = shuffleDeck(createDeck());
    const newPlayerCards = [deck[0], deck[2]];
    const newBankerCards = [deck[1], deck[3]];
    
    setPlayerCards(newPlayerCards);
    setBankerCards(newBankerCards);
    
    const pScore = calculateScore(newPlayerCards);
    const bScore = calculateScore(newBankerCards);
    
    setPlayerScore(pScore);
    setBankerScore(bScore);
    setGameStarted(true);
    setGameOver(false);
    setWinner('');

    // Determine winner
    setTimeout(() => {
      let gameWinner = '';
      if (pScore > bScore) gameWinner = 'player';
      else if (bScore > pScore) gameWinner = 'banker';
      else gameWinner = 'tie';

      setWinner(gameWinner);
      setGameOver(true);

      // Calculate winnings
      let winnings = 0;
      if (betType === gameWinner) {
        if (betType === 'tie') {
          winnings = bet * 8; // 8:1 payout for tie
        } else if (betType === 'banker') {
          winnings = bet * 1.95; // 1.95:1 payout for banker (5% commission)
        } else {
          winnings = bet * 2; // 2:1 payout for player
        }
        updateBalance(user!.balance + winnings - bet);
        toast({
          title: "You won!",
          description: `You won ${winnings - bet} chips!`,
        });
      } else {
        updateBalance(user!.balance - bet);
        toast({
          title: "You lost",
          description: `You lost ${bet} chips.`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setPlayerCards([]);
    setBankerCards([]);
    setPlayerScore(0);
    setBankerScore(0);
    setWinner('');
  };

  const renderCard = (card: PlayingCard) => {
    return (
      <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-lg font-bold shadow-md">
        <div className={card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}>
          {card.value}
        </div>
        <div className={card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}>
          {card.suit}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Games
          </Button>
          <h1 className="text-4xl font-bold text-white">Baccarat</h1>
          <div className="text-right text-white">
            <p className="text-lg">Balance: {user?.balance} chips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-green-800 border-green-600">
              <CardHeader>
                <CardTitle className="text-white text-center">Game Table</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banker Hand */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Banker: {bankerScore}</h3>
                  <div className="flex justify-center gap-2">
                    {bankerCards.map((card, index) => (
                      <div key={index}>{renderCard(card)}</div>
                    ))}
                  </div>
                </div>

                {/* Game Status */}
                {gameOver && (
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">
                      {winner === 'tie' ? 'Tie!' : `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!`}
                    </div>
                    <div className="text-white">
                      Player: {playerScore} | Banker: {bankerScore}
                    </div>
                  </div>
                )}

                {/* Player Hand */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Player: {playerScore}</h3>
                  <div className="flex justify-center gap-2">
                    {playerCards.map((card, index) => (
                      <div key={index}>{renderCard(card)}</div>
                    ))}
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

                <div>
                  <label className="block text-white mb-2">Bet On:</label>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setBetType('player')}
                      variant={betType === 'player' ? 'default' : 'outline'}
                      className="w-full"
                      disabled={gameStarted && !gameOver}
                    >
                      Player (2:1)
                    </Button>
                    <Button
                      onClick={() => setBetType('banker')}
                      variant={betType === 'banker' ? 'default' : 'outline'}
                      className="w-full"
                      disabled={gameStarted && !gameOver}
                    >
                      Banker (1.95:1)
                    </Button>
                    <Button
                      onClick={() => setBetType('tie')}
                      variant={betType === 'tie' ? 'default' : 'outline'}
                      className="w-full"
                      disabled={gameStarted && !gameOver}
                    >
                      Tie (8:1)
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {!gameStarted || gameOver ? (
                    <Button onClick={startGame} className="w-full" size="lg">
                      Deal Cards
                    </Button>
                  ) : (
                    <div className="text-center text-white">
                      Dealing cards...
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
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-white text-sm space-y-2">
                <p>• Bet on Player, Banker, or Tie</p>
                <p>• Cards 2-9 = face value</p>
                <p>• Ace = 1 point</p>
                <p>• 10, J, Q, K = 0 points</p>
                <p>• Total is the last digit of the sum</p>
                <p>• Closest to 9 wins</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Baccarat;