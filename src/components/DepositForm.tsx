
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DepositFormProps {
  onBack: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // BLIK payment field
  const [blikCode, setBlikCode] = useState('');
  
  // PayPal modal
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');
  
  const { deposit } = useAuth();

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: "Błąd", description: "Wprowadź prawidłową kwotę", variant: "destructive" });
      return;
    }

    // Validate based on payment method
    if (paymentMethod === 'card') {
      if (!cardNumber || !cvv || !expiryDate) {
        toast({ title: "Błąd", description: "Wypełnij wszystkie pola karty", variant: "destructive" });
        return;
      }
    } else if (paymentMethod === 'blik') {
      if (!blikCode || blikCode.length !== 6) {
        toast({ title: "Błąd", description: "Wprowadź 6-cyfrowy kod BLIK", variant: "destructive" });
        return;
      }
    } else if (paymentMethod === 'paypal') {
      setShowPayPalModal(true);
      return;
    }

    processPayment(depositAmount);
  };

  const processPayment = (depositAmount: number) => {
    deposit(depositAmount);
    
    const methodNames = {
      card: 'kartą',
      blik: 'BLIK',
      paypal: 'PayPal'
    };
    
    toast({ 
      title: "Sukces", 
      description: `Wpłacono ${depositAmount.toFixed(2)} PLN ${methodNames[paymentMethod as keyof typeof methodNames]}!` 
    });
    
    // Reset form
    setAmount('');
    setCardNumber('');
    setCvv('');
    setExpiryDate('');
    setBlikCode('');
    setPaypalEmail('');
    setPaypalPassword('');
    setShowPayPalModal(false);
    onBack();
  };

  const handlePayPalSubmit = () => {
    if (!paypalEmail || !paypalPassword) {
      toast({ title: "Błąd", description: "Wypełnij dane PayPal", variant: "destructive" });
      return;
    }
    
    const depositAmount = parseFloat(amount);
    processPayment(depositAmount);
  };

  const quickAmounts = [100, 250, 500, 1000];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{2,4}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 2) {
      parts.push(match.substring(i, i + 2));
    }
    if (parts.length > 1) {
      return parts.join('/');
    } else {
      return match;
    }
  };

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

              {/* Payment method selection */}
              <div className="space-y-2">
                <Label className="text-white text-lg">Metoda płatności</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="card" className="text-white">💳 Karta płatnicza</SelectItem>
                    <SelectItem value="blik" className="text-white">📱 BLIK</SelectItem>
                    <SelectItem value="paypal" className="text-white">💰 PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment method specific fields */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 p-6 bg-gray-800 rounded-lg border border-gray-600">
                  <h3 className="text-white text-lg font-semibold">Dane karty</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-white">Numer karty</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="bg-gray-700 border-gray-500 text-white"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-white">CVV/CCV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className="bg-gray-700 border-gray-500 text-white"
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-white">Data ważności</Label>
                        <Input
                          id="expiryDate"
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          className="bg-gray-700 border-gray-500 text-white"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'blik' && (
                <div className="space-y-4 p-6 bg-gray-800 rounded-lg border border-gray-600">
                  <h3 className="text-white text-lg font-semibold">Płatność BLIK</h3>
                  <div className="space-y-2">
                    <Label htmlFor="blikCode" className="text-white">6-cyfrowy kod BLIK</Label>
                    <Input
                      id="blikCode"
                      type="text"
                      value={blikCode}
                      onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-gray-700 border-gray-500 text-white text-center text-2xl"
                      placeholder="123456"
                      maxLength={6}
                    />
                    <p className="text-gray-400 text-sm">
                      📱 Wygeneruj kod w aplikacji bankowej
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4 p-6 bg-gray-800 rounded-lg border border-gray-600">
                  <h3 className="text-white text-lg font-semibold">Płatność PayPal</h3>
                  <p className="text-gray-400 text-sm">
                    💰 Zostaniesz przekierowany do bezpiecznego okna PayPal
                  </p>
                </div>
              )}

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
                disabled={!amount}
              >
                {paymentMethod === 'card' && <CreditCard className="h-5 w-5 mr-2" />}
                {paymentMethod === 'blik' && <Smartphone className="h-5 w-5 mr-2" />}
                {paymentMethod === 'paypal' && <DollarSign className="h-5 w-5 mr-2" />}
                Wpłać {amount ? `${parseFloat(amount).toFixed(2)} PLN` : 'środki'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* PayPal Modal */}
        {showPayPalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="bg-white border border-gray-300 max-w-md w-full">
              <CardHeader className="text-center bg-blue-600 text-white">
                <CardTitle className="text-2xl font-bold">PayPal</CardTitle>
                <CardDescription className="text-blue-100">
                  Bezpieczna płatność online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center">
                  <div className="text-gray-700 text-lg mb-2">Kwota do zapłaty</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {parseFloat(amount || '0').toFixed(2)} PLN
                  </div>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handlePayPalSubmit(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail" className="text-gray-700">Email PayPal</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="border-gray-300"
                      placeholder="twoj.email@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalPassword" className="text-gray-700">Hasło</Label>
                    <Input
                      id="paypalPassword"
                      type="password"
                      value={paypalPassword}
                      onChange={(e) => setPaypalPassword(e.target.value)}
                      className="border-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Zapłać teraz
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setShowPayPalModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Anuluj
                    </Button>
                  </div>
                </form>
                
                <div className="text-xs text-gray-500 text-center">
                  🔒 To jest symulacja PayPal - możesz wpisać dowolne dane
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositForm;
