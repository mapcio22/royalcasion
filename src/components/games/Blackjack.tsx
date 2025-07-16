
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Coins, Plus, Minus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BlackjackProps {
  onBack: () => void;
}

interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

const Blackjack: React.FC<BlackjackProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showDealerCards, setShowDealerCards] = useState(false);

  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = (): PlayingCard[] => {
    const deck: PlayingCard[] = [];
    for (const suit of suits) {
      for (const value of values) {
        let numericValue = parseInt(value);
        if (value === 'A') numericValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        
        deck.push({ suit, value, numericValue });
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (cards: PlayingCard[]): number => {
    let score = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (card.value === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.numericValue;
      }
    }
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const startGame = () => {
    const betAmount = parseFloat(bet);
    
    if (!user || !betAmount || betAmount <= 0) {
      toast({ title: "Błąd", description: "Wprowadź poprawną stawkę!", variant: "destructive" });
      return;
    }

    if (user.balance < betAmount) {
      toast({ title: "Błąd", description: "Niewystarczające środki!", variant: "destructive" });
      return;
    }

    updateBalance(user.balance - betAmount);
    
    const deck = createDeck();
    const newPlayerCards = [deck[0], deck[2]];
    const newDealerCards = [deck[1], deck[3]];
    
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setPlayerScore(calculateScore(newPlayerCards));
    setDealerScore(calculateScore(newDealerCards));
    setGameState('playing');
    setShowDealerCards(false);
    setGameResult(null);
  };

  const hit = () => {
    const deck = createDeck();
    const newCard = deck[0];
    const newPlayerCards = [...playerCards, newCard];
    const newScore = calculateScore(newPlayerCards);
    
    setPlayerCards(newPlayerCards);
    setPlayerScore(newScore);
    
    if (newScore > 21) {
      setGameState('finished');
      setGameResult('Przegrałeś! Przekroczyłeś 21.');
      setShowDealerCards(true);
    }
  };

  const stand = () => {
    setShowDealerCards(true);
    let newDealerCards = [...dealerCards];
    let newDealerScore = calculateScore(newDealerCards);
    
    // Dealer draws until 17 or higher
    const deck = createDeck();
    let deckIndex = 0;
    while (newDealerScore < 17) {
      newDealerCards.push(deck[deckIndex]);
      newDealerScore = calculateScore(newDealerCards);
      deckIndex++;
    }
    
    setDealerCards(newDealerCards);
    setDealerScore(newDealerScore);
    
    // Determine winner
    const betAmount = parseFloat(bet);
    let result = '';
    
    if (newDealerScore > 21) {
      result = 'Wygrałeś! Krupier przekroczył 21.';
      updateBalance(user!.balance + betAmount * 2);
    } else if (playerScore > newDealerScore) {
      result = 'Wygrałeś!';
      updateBalance(user!.balance + betAmount * 2);
    } else if (playerScore < newDealerScore) {
      result = 'Przegrałeś!';
    } else {
      result = 'Remis!';
      updateBalance(user!.balance + betAmount);
    }
    
    setGameResult(result);
    setGameState('finished');
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerScore(0);
    setDealerScore(0);
    setGameResult(null);
    setShowDealerCards(false);
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-800 border-2 border-blue-600 rounded-lg flex items-center justify-center text-white">
          ?
        </div>
      );
    }
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-sm font-bold">{card.value}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
    );
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
                <CardTitle className="text-3xl font-bold text-white">🃏 Blackjack</CardTitle>
                <CardDescription className="text-gray-300">
                  Zbierz 21 punktów lub więcej niż krupier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dealer Cards */}
                <div className="text-center">
                  <h3 className="text-xl text-white mb-4">
                    Krupier {showDealerCards ? `(${dealerScore})` : ''}
                  </h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {dealerCards.map((card, index) => (
                      <div key={index}>
                        {renderCard(card, index === 1 && !showDealerCards)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Cards */}
                <div className="text-center">
                  <h3 className="text-xl text-white mb-4">
                    Twoje karty ({playerScore})
                  </h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {playerCards.map((card, index) => (
                      <div key={index}>
                        {renderCard(card)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Controls */}
                {gameState === 'playing' && (
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={hit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dobierz
                    </Button>
                    <Button
                      onClick={stand}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Pas
                    </Button>
                  </div>
                )}

                {/* Game Result */}
                {gameResult && (
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-white">
                      {gameResult}
                    </div>
                    <Button
                      onClick={resetGame}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Nowa gra
                    </Button>
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
            {gameState === 'betting' && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Postaw zakład</CardTitle>
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
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Wprowadź stawkę"
                    />
                  </div>

                  <Button
                    onClick={startGame}
                    disabled={!bet || parseFloat(bet) <= 0}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    Rozpocznij grę
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zasady</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300 text-sm">
                <div>• Celem jest zdobycie 21 punktów</div>
                <div>• Figura = 10, As = 1 lub 11</div>
                <div>• Przekroczenie 21 = przegrana</div>
                <div>• Krupier dobiera do 17</div>
                <div>• Wygrana = 2x stawka</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
