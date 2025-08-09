'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';
import { KeyRound, ArrowLeft, Briefcase } from 'lucide-react';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAppData();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
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

    if (password.length < 6) {
      toast({
        title: "Senha Muito Curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await resetPassword({ token, password });
      if (success) {
        toast({
          title: "Senha Alterada!",
          description: "Sua senha foi redefinida com sucesso.",
        });
        router.push('/login');
      } else {
        toast({
          title: "Falha na Redefinição",
          description: "Token inválido ou expirado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Redefinição",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-effect p-8 rounded-xl shadow-2xl border border-white/10 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Token Inválido</h1>
          <p className="text-gray-400 mb-6">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium">
            Solicitar novo link
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white">ERP PRO</h1>
          <p className="text-gray-400">Nova Senha</p>
        </div>

        {email && (
          <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-gray-300">
              Redefinindo senha para: <span className="text-blue-400">{email}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Confirme a nova senha"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3">
            <KeyRound className="w-5 h-5 mr-2" />
            Redefinir Senha
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage; 