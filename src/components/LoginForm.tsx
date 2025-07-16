
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({ title: "Błąd", description: "Wypełnij wszystkie pola", variant: "destructive" });
      return;
    }

    const success = await login(loginData.username, loginData.password);
    if (!success) {
      toast({ title: "Błąd", description: "Nieprawidłowe dane logowania", variant: "destructive" });
    } else {
      toast({ title: "Sukces", description: "Zalogowano pomyślnie!" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
      toast({ title: "Błąd", description: "Wypełnij wszystkie pola", variant: "destructive" });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Błąd", description: "Hasła nie są identyczne", variant: "destructive" });
      return;
    }

    const success = await register(registerData.username, registerData.password);
    if (!success) {
      toast({ title: "Błąd", description: "Użytkownik o tej nazwie już istnieje", variant: "destructive" });
    } else {
      toast({ title: "Sukces", description: "Konto utworzone pomyślnie!" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">🎰 Royal Casino</CardTitle>
          <CardDescription className="text-gray-300">
            Witaj w najlepszym kasynie online!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-purple-600">
                Logowanie
              </TabsTrigger>
              <TabsTrigger value="register" className="text-white data-[state=active]:bg-purple-600">
                Rejestracja
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-white">Nazwa użytkownika</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Wprowadź nazwę użytkownika"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Hasło</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Wprowadź hasło"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  Zaloguj się
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-white">Nazwa użytkownika</Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Wybierz nazwę użytkownika"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Hasło</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Wprowadź hasło"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Potwierdź hasło</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Potwierdź hasło"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Zarejestruj się
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
