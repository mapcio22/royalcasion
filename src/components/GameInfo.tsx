
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gamepad2 } from 'lucide-react';

interface GameInfoProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ onBack, onNavigate }) => {
  const games = [
    {
      id: 'roulette',
      name: '🎯 Ruletka',
      description: 'Gracze obstawiają numery lub kolory na obrotowym kole. Celem jest przewidzenie, gdzie zatrzyma się kula. Koło składa się z 37 (wersja europejska) lub 38 (wersja amerykańska) segmentów.',
      rules: 'Gracze mogą obstawiać różne kombinacje, a po zakręceniu kołem wygrywają ci, którzy trafili w odpowiedni numer lub kolor.',
      cost: 'Dowolna stawka'
    },
    {
      id: 'blackjack',
      name: '🃏 Blackjack',
      description: 'Gra karciana, w której celem jest uzyskanie sumy punktów jak najbliższej 21, nie przekraczając tej liczby. Gracze mają możliwość "dobierania" kart (hit) lub "zatrzymania się" (stand).',
      rules: 'As liczy się jako 1 lub 11, figury (król, dama, walet) to 10, a reszta kart ma swoją nominalną wartość.',
      cost: 'Dowolna stawka'
    },
    {
      id: 'slot',
      name: '🎰 Sloty (Automaty)',
      description: 'To maszyny, które wyświetlają bębny z różnymi symbolami. Gracze starają się uzyskać odpowiednią kombinację symboli na wygrywających liniach.',
      rules: 'Gracz ustawia wysokość zakładu i liczbę linii, po czym uruchamia bębny. Wygrana zależy od kombinacji symboli.',
      cost: '100 PLN'
    },
    {
      id: 'baccarat',
      name: '🎴 Baccarat',
      description: 'Gra karciana, w której celem jest uzyskanie jak najwyższej wartości kart, maksymalnie 9. Gracze obstawiają, która ręka (gracza lub bankiera) będzie miała wyższy wynik.',
      rules: 'Karty mają przypisaną wartość (as=1, figury=10), a gra polega na porównaniu wyników dwóch rąk.',
      cost: 'Dowolna stawka'
    },
    {
      id: 'plinko',
      name: '🎲 Plinko Ball',
      description: 'Gra, w której kula spada na planszę z przeszkodami, odbijając się i lądując w jednym z dostępnych slotów. Każdy slot ma przypisaną wartość pieniężną.',
      rules: 'Gracz wybiera, gdzie kula zacznie spadać, a następnie czeka, aby zobaczyć, w którym slocie zatrzyma się kulka, co determinuje wysokość wygranej.',
      cost: 'Dowolna stawka'
    },
    {
      id: 'keno',
      name: '🔢 Keno',
      description: 'Gra losowa, w której gracze wybierają kilka liczb spośród 80. Następnie losowane są numery, a wygrane zależą od liczby trafionych liczb.',
      rules: 'Gracze wybierają swoje liczby, a następnie czekają na losowanie. Im więcej liczb trafią, tym wyższa jest ich wygrana.',
      cost: 'Dowolna stawka'
    }
  ];

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📚 Zasady Gier Kasynowych</h1>
          <p className="text-xl text-gray-300">Poznaj zasady i strategie naszych najpopularniejszych gier</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{game.name}</CardTitle>
                <CardDescription className="text-yellow-400 font-semibold">
                  Koszt: {game.cost}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">📖 Opis:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{game.description}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">⚖️ Zasady:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{game.rules}</p>
                </div>

                <Button
                  onClick={() => onNavigate(game.id)}
                  className="w-full bg-black text-white hover:bg-gray-800 border border-gray-600"
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Graj w {game.name.split(' ').slice(1).join(' ')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
