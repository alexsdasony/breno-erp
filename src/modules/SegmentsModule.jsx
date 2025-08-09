import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Edit, Trash2, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

const SegmentsModule = () => {
  const { data, addSegment, updateSegment, deleteSegment, reloadSegments } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentSegment(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (segment) => {
    setIsEditing(true);
    setCurrentSegment(segment);
    setFormData({ name: segment.name, description: segment.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteSegment(id);
    await reloadSegments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do segmento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && currentSegment) {
      await updateSegment(currentSegment.id, formData);
    } else {
      await addSegment(formData);
    }

    await reloadSegments();

    setShowForm(false);
    setFormData({ name: '', description: '' });
    setCurrentSegment(null);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Gerenciar Segmentos de Negócio
          </h1>
          <p className="text-muted-foreground mt-2">Adicione, edite ou remova segmentos.</p>
        </div>
        <Button id="segments-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Segmento
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-6 border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? 'Editar Segmento' : 'Novo Segmento'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="segmentName" className="block text-sm font-medium mb-1">Nome do Segmento</label>
                <input
                  id="segmentName"
                  data-testid="segments-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Comércio, Serviços"
                />
              </div>
              <div>
                <label htmlFor="segmentDescription" className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  id="segmentDescription"
                  data-testid="segments-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Breve descrição do segmento"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <Button id="segments-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Segmento'}
                </Button>
                <Button id="segments-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4">Lista de Segmentos</h3>
        {data.segments.length === 0 ? (
          <p className="text-muted-foreground">Nenhum segmento cadastrado.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 scrollbar-hide">
            <table id="segments-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.segments.map(segment => (
                  <motion.tr
                    key={segment.id}
                    id={`segments-row-${segment.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{segment.name}</td>
                    <td className="p-3 text-muted-foreground">{segment.description}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`segments-edit-${segment.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(segment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button id={`segments-delete-${segment.id}`} variant="ghost" size="sm" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o segmento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction id={`segments-confirm-delete-${segment.id}`} onClick={() => handleDelete(segment.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SegmentsModule;