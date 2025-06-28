
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit3, Save, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData.jsx';

const ProfileModule = () => {
  const { currentUser, updateUserProfile, changeUserPassword, data } = useAppData();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    segmentId: currentUser?.segmentId || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      toast({ title: "Erro", description: "Nome e email são obrigatórios.", variant: "destructive" });
      return;
    }
    const success = updateUserProfile(profileData.name, profileData.email, profileData.segmentId ? parseInt(profileData.segmentId) : null);
    if (success) {
      toast({ title: "Sucesso!", description: "Perfil atualizado." });
      setIsEditingProfile(false);
    } else {
      toast({ title: "Erro", description: "Não foi possível atualizar o perfil. O email pode já estar em uso.", variant: "destructive" });
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast({ title: "Erro", description: "Todos os campos de senha são obrigatórios.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({ title: "Erro", description: "A nova senha e a confirmação não coincidem.", variant: "destructive" });
      return;
    }
    const success = changeUserPassword(passwordData.currentPassword, passwordData.newPassword);
    if (success) {
      toast({ title: "Sucesso!", description: "Senha alterada." });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      toast({ title: "Erro", description: "Senha atual incorreta ou nova senha inválida.", variant: "destructive" });
    }
  };

  if (!currentUser) {
    return (
      <motion.div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-400">Erro: Usuário não encontrado.</h1>
        <p className="text-muted-foreground">Por favor, faça login novamente.</p>
      </motion.div>
    );
  }

  const userSegment = data.segments.find(s => s.id === currentUser.segmentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-500 bg-clip-text text-transparent">
          Meu Perfil
        </h1>
      </div>

      <motion.div className="glass-effect rounded-xl p-6 border" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-sky-300">Informações Pessoais</h2>
          {!isEditingProfile && (<Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}><Edit3 className="w-4 h-4 mr-2" /> Editar Perfil</Button>)}
        </div>

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div className="flex items-center"><User className="w-5 h-5 mr-3 text-sky-400" /><div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{currentUser.name}</p></div></div>
            <div className="flex items-center"><Mail className="w-5 h-5 mr-3 text-sky-400" /><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{currentUser.email}</p></div></div>
            <div className="flex items-center"><Briefcase className="w-5 h-5 mr-3 text-sky-400" /><div><p className="text-sm text-muted-foreground">Segmento</p><p className="font-medium">{userSegment ? userSegment.name : 'Nenhum'}</p></div></div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
              <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Segmento (Opcional)</label>
              <select name="segmentId" value={profileData.segmentId || ''} onChange={handleProfileChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="">Nenhum</option>
                {data.segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button type="submit" className="bg-gradient-to-r from-sky-500 to-cyan-600"><Save className="w-4 h-4 mr-2" /> Salvar Alterações</Button>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
            </div>
          </form>
        )}
      </motion.div>

      <motion.div className="glass-effect rounded-xl p-6 border" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-teal-300">Alterar Senha</h2>
          {!isChangingPassword && (<Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}><Shield className="w-4 h-4 mr-2" /> Alterar Senha</Button>)}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha Atual</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
              <input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="flex space-x-3 pt-2">
              <Button type="submit" className="bg-gradient-to-r from-teal-500 to-emerald-600"><Save className="w-4 h-4 mr-2" /> Salvar Nova Senha</Button>
              <Button variant="outline" onClick={() => { setIsChangingPassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); }}>Cancelar</Button>
            </div>
          </form>
        )}
        {!isChangingPassword && (<p className="text-sm text-muted-foreground">Mantenha sua conta segura alterando sua senha regularmente.</p>)}
      </motion.div>
    </motion.div>
  );
};

export default ProfileModule;
