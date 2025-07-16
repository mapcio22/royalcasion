
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Coins, Spade, Heart } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface TexasPokerProps {
  onBack: () => void;
}

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  color: 'red' | 'black';
}

const TexasPoker: React.FC<TexasPokerProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [gamePhase, setGamePhase] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
  const [pot, setPot] = useState(0);
  const [aiCards, setAiCards] = useState<PlayingCard[]>([]);
  const [winner, setWinner] = useState<string>('');

  const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const createDeck = (): PlayingCard[] => {
    const deck: PlayingCard[] = [];
    suits.forEach(suit => {
      values.forEach(value => {
        deck.push({
          suit,
          value,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black'
        });
      });
    });
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

    updateBalance(user.balance - betAmount);
    setPot(betAmount * 2); // Player bet + AI bet

    const deck = createDeck();
    const newPlayerCards = [deck[0], deck[1]];
    const newAiCards = [deck[2], deck[3]];
    
    setPlayerCards(newPlayerCards);
    setAiCards(newAiCards);
    setCommunityCards([]);
    setGameStarted(true);
    setGameOver(false);
    setGamePhase('preflop');
    setWinner('');

    toast({ 
      title: "Gra rozpoczęta!", 
      description: "Masz 2 karty. Kliknij 'Dalej' aby zobaczyć flop!" 
    });
  };

  const nextPhase = () => {
    const deck = createDeck();
    const usedCards = 4; // 2 player + 2 AI cards
    
    switch (gamePhase) {
      case 'preflop':
        // Flop - 3 cards
        setCommunityCards([deck[usedCards], deck[usedCards + 1], deck[usedCards + 2]]);
        setGamePhase('flop');
        toast({ title: "Flop!", description: "3 karty wspólne zostały odkryte!" });
        break;
      case 'flop':
        // Turn - 1 more card
        setCommunityCards(prev => [...prev, deck[usedCards + 3]]);
        setGamePhase('turn');
        toast({ title: "Turn!", description: "Czwarta karta wspólna!" });
        break;
      case 'turn':
        // River - final card
        setCommunityCards(prev => [...prev, deck[usedCards + 4]]);
        setGamePhase('river');
        toast({ title: "River!", description: "Ostatnia karta wspólna!" });
        break;
      case 'river':
        // Showdown
        determineWinner();
        break;
    }
  };

  const determineWinner = () => {
    // Simplified poker hand evaluation - for demo purposes
    const playerScore = Math.random();
    const aiScore = Math.random();
    
    let gameWinner = '';
    let winAmount = 0;
    
    if (playerScore > aiScore) {
      gameWinner = 'Gracz';
      winAmount = pot;
      updateBalance(user!.balance + pot);
    } else {
      gameWinner = 'AI';
      winAmount = 0;
    }
    
    setWinner(gameWinner);
    setGamePhase('showdown');
    setGameOver(true);
    
    toast({ 
      title: gameWinner === 'Gracz' ? "🎉 Wygrałeś!" : "😞 Przegrałeś", 
      description: gameWinner === 'Gracz' ? `Wygrałeś ${winAmount.toFixed(2)} PLN!` : "Spróbuj ponownie!",
      className: gameWinner === 'Gracz' ? "bg-green-900 border-green-600" : "bg-red-900 border-red-600"
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setPlayerCards([]);
    setCommunityCards([]);
    setAiCards([]);
    setGamePhase('preflop');
    setPot(0);
    setWinner('');
    setBet('');
  };

  const renderCard = (card: PlayingCard, hidden: boolean = false) => (
    <div className={`w-16 h-24 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center text-sm font-bold ${
      hidden ? 'bg-blue-900' : 'bg-white'
    }`}>
      {hidden ? (
        <div className="text-white">🂠</div>
      ) : (
        <>
          <div className={`text-lg ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
            {card.value}
          </div>
          <div className={`text-xl ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
            {card.suit}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
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
                <CardTitle className="text-3xl font-bold text-white">🃏 Texas Hold'em Poker</CardTitle>
                <CardDescription className="text-gray-300">
                  Klasyczny poker - pokonaj AI z najlepszą ręką!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Info */}
                {gameStarted && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Faza gry</div>
                      <div className="text-white font-bold capitalize">{gamePhase}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Pula</div>
                      <div className="text-yellow-400 font-bold">{pot.toFixed(2)} PLN</div>
                    </div>
                  </div>
                )}

                {/* Community Cards */}
                {communityCards.length > 0 && (
                  <div className="text-center">
                    <h3 className="text-white text-lg mb-4">Karty wspólne</h3>
                    <div className="flex justify-center gap-2">
                      {communityCards.map((card, index) => (
                        <div key={index}>
                          {renderCard(card)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Cards */}
                {gameStarted && (
                  <div className="text-center">
                    <h3 className="text-white text-lg mb-4">Karty AI</h3>
                    <div className="flex justify-center gap-2">
                      {aiCards.map((card, index) => (
                        <div key={index}>
                          {renderCard(card, gamePhase !== 'showdown')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player Cards */}
                {gameStarted && (
                  <div className="text-center">
                    <h3 className="text-white text-lg mb-4">Twoje karty</h3>
                    <div className="flex justify-center gap-2">
                      {playerCards.map((card, index) => (
                        <div key={index}>
                          {renderCard(card)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Game Controls */}
                <div className="text-center space-y-4">
                  {gameStarted && !gameOver && gamePhase !== 'showdown' && (
                    <Button
                      onClick={nextPhase}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 text-lg"
                    >
                      {gamePhase === 'preflop' ? 'Pokaż Flop' : 
                       gamePhase === 'flop' ? 'Pokaż Turn' : 
                       gamePhase === 'turn' ? 'Pokaż River' : 'Rozstrzygnij'}
                    </Button>
                  )}

                  {!gameStarted && (
                    <div className="text-gray-300 text-lg">
                      Ustaw stawkę i rozpocznij grę!
                    </div>
                  )}

                  {gameOver && (
                    <div className="space-y-4">
                      <div className={`text-2xl font-bold ${winner === 'Gracz' ? 'text-green-400' : 'text-red-400'}`}>
                        {winner === 'Gracz' ? '🎉 Wygrałeś!' : '😞 Przegrałeś!'}
                      </div>
                      {winner === 'Gracz' && (
                        <div className="text-white text-lg">
                          Wygrałeś {pot.toFixed(2)} PLN!
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

                {!gameStarted && (
                  <Button
                    onClick={startGame}
                    disabled={!bet || parseFloat(bet) <= 0}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    <Heart className="h-5 w-5 mr-2" />
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
                  <Spade className="h-4 w-4 text-white" />
                  <span>Otrzymujesz <strong>2 karty</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span><strong>5 kart wspólnych</strong> na stole</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>Stwórz najlepszą <strong>5-kartową rękę</strong></span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-3">
                  <div className="text-xs text-gray-400">Kolejność ręk:</div>
                  <div className="text-xs">Para, Dwie pary, Trójka, Strit, Kolor, Full, Kareta, Poker królewski</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TexasPoker;
