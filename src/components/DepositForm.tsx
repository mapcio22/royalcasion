
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DepositFormProps {
  onBack: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const { deposit } = useAuth();

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: "Błąd", description: "Wprowadź prawidłową kwotę", variant: "destructive" });
      return;
    }

    if (!cardNumber) {
      toast({ title: "Błąd", description: "Wprowadź numer karty", variant: "destructive" });
      return;
    }

    deposit(depositAmount);
    toast({ 
      title: "Sukces", 
      description: `Wpłacono ${depositAmount.toFixed(2)} PLN na konto!` 
    });
    
    setAmount('');
    setCardNumber('');
    onBack();
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do panelu
        </Button>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center">
              <CreditCard className="h-8 w-8 mr-3 text-green-500" />
              Wpłata środków
            </CardTitle>
            <CardDescription className="text-gray-300">
              Doładuj swoje konto i graj w ulubione gry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick amounts */}
            <div className="space-y-3">
              <Label className="text-white text-lg">Szybkie kwoty</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    {quickAmount} PLN
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-6">
              {/* Custom amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white text-lg">Kwota wpłaty (PLN)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-xl h-14"
                  placeholder="0.00"
                />
              </div>

              {/* Card details */}
              <div className="space-y-4 p-6 bg-gray-800 rounded-lg border border-gray-600">
                <h3 className="text-white text-lg font-semibold">Dane karty (symulacja)</h3>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-white">Numer karty</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-gray-700 border-gray-500 text-white"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <p className="text-gray-400 text-sm">
                    ⚠️ To jest symulacja - możesz wpisać dowolny numer
                  </p>
                </div>
              </div>

              {/* Summary */}
              {amount && (
                <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                  <div className="text-white">
                    <span className="text-lg">Kwota do wpłaty: </span>
                    <span className="text-2xl font-bold text-green-400">
                      {parseFloat(amount || '0').toFixed(2)} PLN
                    </span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg"
                disabled={!amount || !cardNumber}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Wpłać {amount ? `${parseFloat(amount).toFixed(2)} PLN` : 'środki'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepositForm;
