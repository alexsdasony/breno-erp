import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';
import { UserPlus, LogIn, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { registerUser } = useAppData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Campos Vazios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Senhas Diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await registerUser(name, email, password);
      if (success) {
        toast({
          title: "Cadastro Realizado!",
          description: "Seu usuário foi criado. Faça login para continuar.",
        });
        navigate('/login');
      } else {
        toast({
          title: "Falha no Cadastro",
          description: "Este email já está em uso. Tente outro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Cadastro",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-effect p-8 rounded-xl shadow-2xl border border-white/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crie sua Conta no ERP Pro</h1>
          <p className="text-gray-400">Rápido e fácil</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Crie uma senha forte"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Confirme sua senha"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3">
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastrar
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Faça login aqui
              <LogIn className="inline w-4 h-4 ml-1" />
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;