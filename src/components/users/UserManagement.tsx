'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Key,
  User as UserIcon,
  UserX,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData';
import apiService from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'ativo' | 'inativo';
  segment_id: string | null;
  created_at: string;
  updated_at: string;
  last_login?: string;
  segment?: {
    id: string;
    name: string;
  };
}

interface UseUsersState {
  items: User[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface UseUsersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<User>) => Promise<User | null>;
  update: (id: string, data: Partial<User>) => Promise<User | null>;
  remove: (id: string) => Promise<boolean>;
  resetPassword: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

function useUsers(): UseUsersState & UseUsersApi {
  const [state, setState] = useState<UseUsersState>({
    items: [],
    loading: false,
    page: 1,
    hasMore: true
  });

  const load = React.useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const response = await apiService.getUsers({ page, pageSize: PAGE_SIZE });
      const users = response.data?.users || [];
      setState((s) => ({
        items: reset ? users : [...s.items, ...users],
        loading: false,
        page,
        hasMore: users.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar usuários',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.page]);

  const loadMore = React.useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    try {
      const response = await apiService.getUsers({ page: nextPage, pageSize: PAGE_SIZE });
      const users = response.data?.users || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...users],
        hasMore: users.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Erro ao carregar mais usuários',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = React.useCallback(async (data: Partial<User>) => {
    try {
      const response = await apiService.createUser(data);
      const user = response.data?.user || response.data;
      setState((s) => ({ ...s, items: [user, ...s.items] }));
      toast({
        title: 'Usuário criado',
        description: user?.name || 'Registro criado com sucesso.'
      });
      return user as User;
    } catch (e) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = React.useCallback(async (id: string, data: Partial<User>) => {
    try {
      const response = await apiService.updateUser(id, data);
      const user = response.data?.user || response.data;
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === id ? user : item)),
      }));
      toast({
        title: 'Usuário atualizado',
        description: user?.name || 'Registro atualizado com sucesso.'
      });
      return user as User;
    } catch (e) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const remove = React.useCallback(async (id: string) => {
    try {
      await apiService.deleteUser(id);
      setState((s) => ({
        ...s,
        items: s.items.filter((item) => item.id !== id),
      }));
      toast({
        title: 'Usuário removido',
        description: 'Registro removido com sucesso.'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao remover usuário',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const resetPassword = React.useCallback(async (id: string) => {
    try {
      await apiService.updateUser(id, { password: 'senha123' });
      toast({
        title: 'Senha resetada',
        description: 'A senha foi resetada para "senha123".'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao resetar senha',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  React.useEffect(() => {
    load(true);
  }, []);

  return {
    ...state,
    load,
    loadMore,
    create,
    update,
    remove,
    resetPassword
  };
}

export default function UserManagement() {
  const { items, loading, hasMore, loadMore, create, update, remove, resetPassword } = useUsers();
  const { segments, activeSegmentId, currentUser, authLoading } = useAppData();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    segment_id: '',
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  const segmentOptions = useMemo(() => (segments || []).map((s: any) => ({ value: String(s.id), label: s.name })), [segments]);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // If not authenticated, show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return items.filter((user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [items, searchTerm, statusFilter, roleFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const totalUsers = items.length;
    const activeUsers = items.filter(u => u.status === 'ativo').length;
    const adminUsers = items.filter(u => u.role === 'admin').length;
    const inactiveUsers = items.filter(u => u.status === 'inativo').length;
    
    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers
    };
  }, [items]);

  // Helper functions
  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inativo': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Event handlers
  const handleCreate = () => {
    setFormData({
      segment_id: '',
      name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'ativo'
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      segment_id: user.segment_id || '',
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      await remove(selectedUser.id);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (user: User) => {
    if (window.confirm(`Resetar senha do usuário ${user.name}?`)) {
      await resetPassword(user.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Nome e email são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    if (!isEditing && !formData.password) {
      toast({
        title: 'Erro',
        description: 'Senha é obrigatória para novos usuários.',
        variant: 'destructive'
      });
      return;
    }

    const submitData: Partial<User> & { password?: string } = { ...formData };
    if (isEditing && !submitData.password) {
      const { password, ...dataWithoutPassword } = submitData;
      const finalData = dataWithoutPassword;
      const success = await update(selectedUser!.id, finalData);
      if (success) {
        setShowForm(false);
        setSelectedUser(null);
      }
      return;
    }

    const success = isEditing 
      ? await update(selectedUser!.id, submitData)
      : await create(submitData);

    if (success) {
      setShowForm(false);
      setSelectedUser(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-400 mt-1">Gerencie usuários do sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Usuários</p>
              <p className="text-2xl font-bold text-white">{kpis.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-400">{kpis.activeUsers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Administradores</p>
              <p className="text-2xl font-bold text-blue-400">{kpis.adminUsers}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Usuários Inativos</p>
              <p className="text-2xl font-bold text-red-400">{kpis.inactiveUsers}</p>
            </div>
            <UserX className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Perfis</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuário</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Usuário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Perfil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Segmento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Criado em</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-600 text-gray-200'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-300">
                          {user.segment?.name || 'Master'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'ativo' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {hasMore && (
                <div className="flex justify-center mt-6 p-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    ) : (
                      'Carregar mais'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Nome</Label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Email</Label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Senha {isEditing && '(deixe em branco para manter)'}</Label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isEditing}
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Perfil</Label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300">Segmento</Label>
                  <select
                    name="segment_id"
                    value={formData.segment_id}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nenhum (Master)</option>
                    {segmentOptions.map(segment => (
                      <option key={segment.value} value={segment.value}>{segment.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300">Status</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isEditing ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Detalhes do Usuário</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Perfil</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(selectedUser.role)}
                      <span className="text-sm">
                        {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedUser.status)}
                      <span className="text-sm">
                        {selectedUser.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Segmento</Label>
                    <p className="text-sm text-gray-300 mt-1">
                      {selectedUser.segment?.name || 'Master'}
                    </p>
                  </div>
                  <div>
                    <Label>Criado em</Label>
                    <p className="text-sm text-gray-300 mt-1">
                      {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Confirmar Exclusão</h3>
                <p className="text-gray-400 mb-6">
                  Tem certeza que deseja excluir o usuário <strong>{selectedUser.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}