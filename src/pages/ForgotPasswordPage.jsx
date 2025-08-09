'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';
import { Mail, ArrowLeft, Briefcase } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { requestPasswordReset } = useAppData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await requestPasswordReset({ email });
      if (success) {
        toast({
          title: "Email Enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
        router.push('/login');
      } else {
        toast({
          title: "Falha no Envio",
          description: "Email não encontrado. Verifique o endereço.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Envio",
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
          <h1 className="text-3xl font-bold text-white">ERP PRO</h1>
          <p className="text-gray-400">Recuperar Senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3">
            <Mail className="w-5 h-5 mr-2" />
            Enviar Email
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

export default ForgotPasswordPage;