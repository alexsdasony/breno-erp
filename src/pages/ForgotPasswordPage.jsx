import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';
import { Mail, ArrowLeft, Briefcase, Phone, MessageCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resetMethod, setResetMethod] = useState('email'); // 'email' or 'phone'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { requestPasswordReset } = useAppData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (resetMethod === 'email' && !email) {
        toast({
          title: "Campo Vazio",
          description: "Por favor, preencha seu email.",
          variant: "destructive",
        });
        return;
      }

      if (resetMethod === 'phone' && !phone) {
        toast({
          title: "Campo Vazio",
          description: "Por favor, preencha seu número de telefone.",
          variant: "destructive",
        });
        return;
      }

      const response = await requestPasswordReset(
        resetMethod === 'email' ? email : null,
        resetMethod === 'phone' ? phone : null
      );

      if (response.method === 'whatsapp') {
        toast({
          title: "Código Enviado! 📱",
          description: "Um código de verificação foi enviado para seu WhatsApp. Verifique suas mensagens.",
        });
      } else {
        toast({
          title: "Código Gerado! 📧",
          description: "Código de verificação gerado. Verifique o console para desenvolvimento.",
        });
        console.log(`[DEV] Código de reset: ${response.resetCode}`);
      }

      // Redirecionar para página de reset com código
      navigate('/reset-password', { 
        state: { 
          email: resetMethod === 'email' ? email : null,
          phone: resetMethod === 'phone' ? phone : null,
          method: response.method
        } 
      });

    } catch (error) {
      console.error('Reset request error:', error);
      toast({
        title: "Erro na Solicitação",
        description: error.response?.data?.error || "Falha ao processar solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-white">Recuperar Senha</h1>
          <p className="text-gray-400 mt-1">Escolha como receber o código de verificação.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Método de Reset */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Método de Recuperação</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setResetMethod('email')}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${
                  resetMethod === 'email'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-gray-300 hover:border-blue-500'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setResetMethod('phone')}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${
                  resetMethod === 'phone'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-gray-300 hover:border-green-500'
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Campo Email */}
          {resetMethod === 'email' && (
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
          )}

          {/* Campo Telefone */}
          {resetMethod === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número de Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="(11) 99999-9999"
              />
              <p className="text-xs text-gray-500 mt-1">
                O código será enviado via WhatsApp
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-semibold py-3 ${
              resetMethod === 'email'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } text-white`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </div>
            ) : (
              <>
                {resetMethod === 'email' ? (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Código por Email
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Enviar Código por WhatsApp
                  </>
                )}
              </>
            )}
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link to="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;