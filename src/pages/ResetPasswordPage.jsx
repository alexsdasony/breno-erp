import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';
import { Lock, ArrowLeft, Briefcase, Eye, EyeOff, MessageCircle, Mail } from 'lucide-react';

const ResetPasswordPage = () => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAppData();

  const { email, phone, method } = location.state || {};

  useEffect(() => {
    if (!email && !phone) {
      navigate('/forgot-password');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Código Expirado",
            description: "O código de verificação expirou. Solicite um novo código.",
            variant: "destructive",
          });
          navigate('/forgot-password');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, phone, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações
      if (!resetCode) {
        toast({
          title: "Código Obrigatório",
          description: "Por favor, insira o código de verificação.",
          variant: "destructive",
        });
        return;
      }

      if (!newPassword) {
        toast({
          title: "Senha Obrigatória",
          description: "Por favor, insira a nova senha.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Senha Muito Curta",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Senhas Diferentes",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        return;
      }

      const response = await resetPassword(email, phone, resetCode, newPassword);

      toast({
        title: "Senha Alterada! ✅",
        description: "Sua senha foi redefinida com sucesso. Faça login com a nova senha.",
      });

      navigate('/login');

    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Erro ao Redefinir Senha",
        description: error.response?.data?.error || "Falha ao redefinir senha. Verifique o código e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    navigate('/forgot-password', { 
      state: { 
        email: email || null,
        phone: phone || null,
        method: method || 'email'
      } 
    });
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
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Nova Senha</h1>
          <p className="text-gray-400 mt-1 text-center">
            Digite o código enviado para {method === 'whatsapp' ? 'seu WhatsApp' : 'seu email'}
          </p>
          
          {/* Timer */}
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">Código expira em:</div>
            <div className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código de Verificação */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Código de Verificação
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
              <div className="text-gray-500">
                {method === 'whatsapp' ? (
                  <MessageCircle className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 pr-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 pr-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || timeLeft === 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redefinindo...
              </div>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Redefinir Senha
              </>
            )}
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center space-y-3"
        >
          <button
            onClick={handleResendCode}
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Não recebeu o código? Solicitar novo
          </button>
          
          <div>
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-gray-300 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para o Login
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage; 