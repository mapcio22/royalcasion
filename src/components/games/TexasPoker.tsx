import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TexasPokerProps {
  onBack: () => void;
}

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
  color: 'red' | 'black';
}

interface Player {
  id: number;
  name: string;
  chips: number;
  cards: PlayingCard[];
  currentBet: number;
  folded: boolean;
  allIn: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isActive: boolean;
}

type GamePhase = 'setup' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
type PlayerAction = 'check' | 'call' | 'raise' | 'fold' | 'all-in';

const TexasPoker: React.FC<TexasPokerProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();

  // Game setup
  const [numPlayers, setNumPlayers] = useState(3);
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [startingChips, setStartingChips] = useState(1000);

  // Game state
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [pot, setPot] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dealerPosition, setDealerPosition] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [currentBet, setCurrentBet] = useState(0);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [winner, setWinner] = useState<string>('');
  const [bettingRoundComplete, setBettingRoundComplete] = useState(false);

  const createDeck = (): PlayingCard[] => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const values = [
      { value: '2', numValue: 2 },
      { value: '3', numValue: 3 },
      { value: '4', numValue: 4 },
      { value: '5', numValue: 5 },
      { value: '6', numValue: 6 },
      { value: '7', numValue: 7 },
      { value: '8', numValue: 8 },
      { value: '9', numValue: 9 },
      { value: '10', numValue: 10 },
      { value: 'J', numValue: 11 },
      { value: 'Q', numValue: 12 },
      { value: 'K', numValue: 13 },
      { value: 'A', numValue: 14 }
    ];

    const newDeck: PlayingCard[] = [];
    suits.forEach(suit => {
      values.forEach(({ value, numValue }) => {
        newDeck.push({
          suit,
          value,
          numValue,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black'
        });
      });
    });

    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    if (user!.balance < startingChips) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough chips to start the game.",
        variant: "destructive",
      });
      return;
    }

    const newDeck = createDeck();
    const newPlayers: Player[] = [];

    // Add user as player 1
    newPlayers.push({
      id: 0,
      name: user!.username,
      chips: startingChips,
      cards: [],
      currentBet: 0,
      folded: false,
      allIn: false,
      isDealer: dealerPosition === 0,
      isSmallBlind: false,
      isBigBlind: false,
      isActive: true
    });

    // Add AI players
    for (let i = 1; i < numPlayers; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        chips: startingChips,
        cards: [],
        currentBet: 0,
        folded: false,
        allIn: false,
        isDealer: dealerPosition === i,
        isSmallBlind: false,
        isBigBlind: false,
        isActive: true
      });
    }

    // Set blinds
    const sbPosition = (dealerPosition + 1) % numPlayers;
    const bbPosition = (dealerPosition + 2) % numPlayers;
    
    newPlayers[sbPosition].isSmallBlind = true;
    newPlayers[bbPosition].isBigBlind = true;
    newPlayers[sbPosition].currentBet = smallBlind;
    newPlayers[bbPosition].currentBet = bigBlind;
    newPlayers[sbPosition].chips -= smallBlind;
    newPlayers[bbPosition].chips -= bigBlind;

    setPlayers(newPlayers);
    setDeck(newDeck);
    setPot(smallBlind + bigBlind);
    setCurrentBet(bigBlind);
    setCurrentPlayer((dealerPosition + 3) % numPlayers);
    setCommunityCards([]);
    setGamePhase('preflop');
    setWinner('');
    setBettingRoundComplete(false);

    // Deal hole cards
    dealHoleCards(newDeck, newPlayers);
    
    updateBalance(user!.balance - startingChips);
  };

  const dealHoleCards = (currentDeck: PlayingCard[], currentPlayers: Player[]) => {
    const newDeck = [...currentDeck];
    const updatedPlayers = currentPlayers.map(player => ({
      ...player,
      cards: [newDeck.pop()!, newDeck.pop()!]
    }));
    setPlayers(updatedPlayers);
    setDeck(newDeck);
  };

  const evaluateHand = (playerCards: PlayingCard[], community: PlayingCard[]): { rank: number; name: string; score: number } => {
    const allCards = [...playerCards, ...community];
    const combinations = getAllCombinations(allCards, 5);
    
    let bestHand = { rank: 0, name: 'High Card', score: 0 };
    
    combinations.forEach(combo => {
      const handRank = getHandRank(combo);
      if (handRank.rank > bestHand.rank || (handRank.rank === bestHand.rank && handRank.score > bestHand.score)) {
        bestHand = handRank;
      }
    });
    
    return bestHand;
  };

  const getAllCombinations = (cards: PlayingCard[], size: number): PlayingCard[][] => {
    if (size === 1) return cards.map(card => [card]);
    
    const combinations: PlayingCard[][] = [];
    for (let i = 0; i <= cards.length - size; i++) {
      const smaller = getAllCombinations(cards.slice(i + 1), size - 1);
      smaller.forEach(combo => combinations.push([cards[i], ...combo]));
    }
    return combinations;
  };

  const getHandRank = (cards: PlayingCard[]): { rank: number; name: string; score: number } => {
    const sorted = cards.sort((a, b) => b.numValue - a.numValue);
    const values = sorted.map(c => c.numValue);
    const suits = sorted.map(c => c.suit);
    
    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = values.every((val, i) => i === 0 || val === values[i-1] - 1);
    
    const valueCounts: { [key: number]: number } = {};
    values.forEach(val => valueCounts[val] = (valueCounts[val] || 0) + 1);
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const score = values.reduce((sum, val, i) => sum + val * Math.pow(15, 4 - i), 0);
    
    if (isStraight && isFlush && values[0] === 14) return { rank: 10, name: 'Royal Flush', score: score + 1000000 };
    if (isStraight && isFlush) return { rank: 9, name: 'Straight Flush', score: score + 900000 };
    if (counts[0] === 4) return { rank: 8, name: 'Four of a Kind', score: score + 800000 };
    if (counts[0] === 3 && counts[1] === 2) return { rank: 7, name: 'Full House', score: score + 700000 };
    if (isFlush) return { rank: 6, name: 'Flush', score: score + 600000 };
    if (isStraight) return { rank: 5, name: 'Straight', score: score + 500000 };
    if (counts[0] === 3) return { rank: 4, name: 'Three of a Kind', score: score + 400000 };
    if (counts[0] === 2 && counts[1] === 2) return { rank: 3, name: 'Two Pair', score: score + 300000 };
    if (counts[0] === 2) return { rank: 2, name: 'Pair', score: score + 200000 };
    return { rank: 1, name: 'High Card', score: score + 100000 };
  };

  const playerAction = (action: PlayerAction, amount?: number) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer];
    
    switch (action) {
      case 'fold':
        player.folded = true;
        player.isActive = false;
        break;
      case 'check':
        if (currentBet > player.currentBet) return; // Can't check if there's a bet
        break;
      case 'call':
        const callAmount = Math.min(currentBet - player.currentBet, player.chips);
        player.currentBet += callAmount;
        player.chips -= callAmount;
        setPot(pot + callAmount);
        if (player.chips === 0) player.allIn = true;
        break;
      case 'raise':
        if (!amount || amount < currentBet * 2) return;
        const raiseTotal = Math.min(amount, player.chips + player.currentBet);
        const raiseDiff = raiseTotal - player.currentBet;
        player.currentBet = raiseTotal;
        player.chips -= raiseDiff;
        setPot(pot + raiseDiff);
        setCurrentBet(raiseTotal);
        if (player.chips === 0) player.allIn = true;
        break;
      case 'all-in':
        const allInAmount = player.chips;
        player.currentBet += allInAmount;
        player.chips = 0;
        player.allIn = true;
        setPot(pot + allInAmount);
        if (player.currentBet > currentBet) setCurrentBet(player.currentBet);
        break;
    }

    setPlayers(newPlayers);
    nextPlayer();
  };

  const aiAction = () => {
    const player = players[currentPlayer];
    if (player.folded || player.allIn || player.id === 0) return;

    // Simple AI logic
    const random = Math.random();
    const callAmount = currentBet - player.currentBet;
    
    if (callAmount === 0) {
      // Can check
      if (random < 0.7) {
        playerAction('check');
      } else {
        playerAction('raise', currentBet + smallBlind);
      }
    } else if (callAmount <= player.chips * 0.1) {
      // Small bet - usually call
      if (random < 0.8) {
        playerAction('call');
      } else {
        playerAction('fold');
      }
    } else if (callAmount <= player.chips * 0.3) {
      // Medium bet - sometimes call
      if (random < 0.5) {
        playerAction('call');
      } else {
        playerAction('fold');
      }
    } else {
      // Large bet - usually fold
      if (random < 0.2) {
        playerAction('call');
      } else {
        playerAction('fold');
      }
    }
  };

  const nextPlayer = () => {
    const activePlayers = players.filter(p => p.isActive && !p.folded && !p.allIn);
    if (activePlayers.length <= 1) {
      nextPhase();
      return;
    }

    let nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    while (players[nextPlayerIndex].folded || players[nextPlayerIndex].allIn) {
      nextPlayerIndex = (nextPlayerIndex + 1) % numPlayers;
    }

    // Check if betting round is complete
    const bettingComplete = players.every(p => 
      p.folded || p.allIn || p.currentBet === currentBet
    );

    if (bettingComplete) {
      nextPhase();
    } else {
      setCurrentPlayer(nextPlayerIndex);
    }
  };

  useEffect(() => {
    if (gamePhase !== 'setup' && gamePhase !== 'showdown' && gamePhase !== 'finished') {
      const timer = setTimeout(() => {
        if (players[currentPlayer] && players[currentPlayer].id !== 0) {
          aiAction();
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gamePhase]);

  const nextPhase = () => {
    const newDeck = [...deck];
    const newCommunity = [...communityCards];

    // Reset current bets for next round
    const newPlayers = players.map(p => ({ ...p, currentBet: 0 }));
    setPlayers(newPlayers);
    setCurrentBet(0);

    switch (gamePhase) {
      case 'preflop':
        // Deal flop (3 cards)
        newDeck.pop(); // Burn card
        newCommunity.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!);
        setGamePhase('flop');
        break;
      case 'flop':
        // Deal turn (1 card)
        newDeck.pop(); // Burn card
        newCommunity.push(newDeck.pop()!);
        setGamePhase('turn');
        break;
      case 'turn':
        // Deal river (1 card)
        newDeck.pop(); // Burn card
        newCommunity.push(newDeck.pop()!);
        setGamePhase('river');
        break;
      case 'river':
        setGamePhase('showdown');
        determineWinner();
        return;
    }

    setCommunityCards(newCommunity);
    setDeck(newDeck);
    setCurrentPlayer((dealerPosition + 1) % numPlayers);
  };

  const determineWinner = () => {
    const activePlayers = players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      setWinner(`${winner.name} wins! (Others folded)`);
      awardPot(winner);
      return;
    }

    const hands = activePlayers.map(player => ({
      player,
      hand: evaluateHand(player.cards, communityCards)
    }));

    hands.sort((a, b) => {
      if (a.hand.rank !== b.hand.rank) return b.hand.rank - a.hand.rank;
      return b.hand.score - a.hand.score;
    });

    const winningPlayer = hands[0].player;
    setWinner(`${winningPlayer.name} wins with ${hands[0].hand.name}!`);
    awardPot(winningPlayer);
  };

  const awardPot = (winningPlayer: Player) => {
    const newPlayers = players.map(p => 
      p.id === winningPlayer.id ? { ...p, chips: p.chips + pot } : p
    );
    setPlayers(newPlayers);

    if (winningPlayer.id === 0) {
      updateBalance(user!.balance + pot);
    }

    setPot(0);
    setGamePhase('finished');
  };

  const startNewHand = () => {
    setDealerPosition((dealerPosition + 1) % numPlayers);
    setGamePhase('setup');
    setCommunityCards([]);
    setWinner('');
    const newPlayers = players.map(p => ({
      ...p,
      cards: [],
      currentBet: 0,
      folded: false,
      allIn: false,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      isActive: true
    }));
    setPlayers(newPlayers);
  };

  const getCurrentPlayerActions = () => {
    const player = players[currentPlayer];
    if (!player || player.folded || player.allIn || player.id !== 0) return null;

    const canCheck = currentBet === player.currentBet;
    const canCall = currentBet > player.currentBet && player.chips > 0;
    const canRaise = player.chips > currentBet - player.currentBet;

    return { canCheck, canCall, canRaise, player };
  };

  const renderCard = (card: PlayingCard, hidden: boolean = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-800 border-2 border-white rounded-lg flex items-center justify-center">
          <div className="text-white text-xs">🂠</div>
        </div>
      );
    }

    return (
      <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-sm font-bold shadow-md">
        <div className={card.color === 'red' ? 'text-red-500' : 'text-black'}>
          {card.value}
        </div>
        <div className={card.color === 'red' ? 'text-red-500' : 'text-black'}>
          {card.suit}
        </div>
      </div>
    );
  };

  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="outline" className="text-white border-white">
              ← Back to Games
            </Button>
            <h1 className="text-4xl font-bold text-white">Texas Hold'em Poker</h1>
            <div className="text-right text-white">
              <p className="text-lg">Balance: {user?.balance} chips</p>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Game Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Number of Players (2-6):</label>
                  <Input
                    type="number"
                    min="2"
                    max="6"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Starting Chips:</label>
                  <Input
                    type="number"
                    value={startingChips}
                    onChange={(e) => setStartingChips(Math.max(100, parseInt(e.target.value) || 1000))}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Small Blind:</label>
                  <Input
                    type="number"
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(Math.max(1, parseInt(e.target.value) || 10))}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Big Blind:</label>
                  <Input
                    type="number"
                    value={bigBlind}
                    onChange={(e) => setBigBlind(Math.max(smallBlind * 2, parseInt(e.target.value) || 20))}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </div>
              
              <Button onClick={initializeGame} className="w-full" size="lg">
                Start Game
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-white text-sm space-y-2">
              <p>• Each player gets 2 hole cards</p>
              <p>• Betting rounds: Pre-flop, Flop (3 cards), Turn (1 card), River (1 card)</p>
              <p>• Actions: Check, Call, Raise, Fold, All-in</p>
              <p>• Best 5-card hand wins the pot</p>
              <p>• Dealer position rotates each hand</p>
              <p>• Small and Big blinds ensure action</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentActions = getCurrentPlayerActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Games
          </Button>
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold">Texas Hold'em Poker</h1>
            <p className="text-lg">Phase: {gamePhase.toUpperCase()} | Pot: {pot} chips</p>
          </div>
          <div className="text-right text-white">
            <p className="text-lg">Your Balance: {user?.balance} chips</p>
          </div>
        </div>

        {/* Community Cards */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-center">Community Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2">
              {communityCards.map((card, index) => (
                <div key={index}>{renderCard(card)}</div>
              ))}
              {Array.from({ length: 5 - communityCards.length }).map((_, index) => (
                <div key={`empty-${index}`} className="w-16 h-24 border-2 border-dashed border-gray-500 rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player, index) => (
            <Card key={player.id} className={`${
              currentPlayer === index && gamePhase !== 'showdown' && gamePhase !== 'finished' 
                ? 'bg-yellow-800 border-yellow-600' 
                : 'bg-gray-800 border-gray-600'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex justify-between items-center">
                  <span>
                    {player.name}
                    {player.isDealer && ' 🔘'}
                    {player.isSmallBlind && ' (SB)'}
                    {player.isBigBlind && ' (BB)'}
                  </span>
                  <span>{player.chips} chips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-1 justify-center">
                  {player.cards.map((card, cardIndex) => (
                    <div key={cardIndex}>
                      {renderCard(card, player.id !== 0 && gamePhase !== 'showdown')}
                    </div>
                  ))}
                </div>
                <div className="text-center text-white text-xs">
                  {player.folded ? 'FOLDED' : 
                   player.allIn ? 'ALL-IN' : 
                   `Bet: ${player.currentBet}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Controls */}
        {currentActions && gamePhase !== 'showdown' && gamePhase !== 'finished' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Your Turn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {currentActions.canCheck && (
                  <Button onClick={() => playerAction('check')} variant="outline">
                    Check
                  </Button>
                )}
                {currentActions.canCall && (
                  <Button onClick={() => playerAction('call')} variant="outline">
                    Call {currentBet - currentActions.player.currentBet}
                  </Button>
                )}
                <Button onClick={() => playerAction('fold')} variant="destructive">
                  Fold
                </Button>
                <Button onClick={() => playerAction('all-in')} variant="default">
                  All-In ({currentActions.player.chips})
                </Button>
              </div>
              
              {currentActions.canRaise && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Raise amount"
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                    className="bg-gray-700 text-white border-gray-600"
                    min={currentBet * 2}
                    max={currentActions.player.chips + currentActions.player.currentBet}
                  />
                  <Button 
                    onClick={() => playerAction('raise', raiseAmount)}
                    disabled={raiseAmount < currentBet * 2}
                  >
                    Raise
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Turn Indicator */}
        {players[currentPlayer] && players[currentPlayer].id !== 0 && gamePhase !== 'showdown' && gamePhase !== 'finished' && (
          <Card className="bg-blue-800 border-blue-600">
            <CardContent className="py-4 text-center">
              <div className="text-white text-lg">
                {players[currentPlayer].name} is thinking...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Results */}
        {gamePhase === 'showdown' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-center">Showdown</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-4">{winner}</div>
              <Button onClick={startNewHand} size="lg">
                Next Hand
              </Button>
            </CardContent>
          </Card>
        )}

        {gamePhase === 'finished' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-center">Hand Complete</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-xl text-yellow-400">{winner}</div>
              <div className="flex gap-4 justify-center">
                <Button onClick={startNewHand} size="lg">
                  Next Hand
                </Button>
                <Button onClick={() => setGamePhase('setup')} variant="outline">
                  New Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TexasPoker;