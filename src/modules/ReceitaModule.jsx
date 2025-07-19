import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import apiService from '../services/api';

const ReceitaModule = () => {
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [dadosCPF, setDadosCPF] = useState(null);
  const [dadosCNPJ, setDadosCNPJ] = useState(null);
  const [loadingCPF, setLoadingCPF] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const { toast } = useToast();

  const formatarCPF = (value) => {
    const cpfLimpo = value.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarCNPJ = (value) => {
    const cnpjLimpo = value.replace(/\D/g, '');
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const consultarCPF = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: "CPF Inválido",
        description: "Digite um CPF válido com 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoadingCPF(true);
    try {
      const response = await apiService.consultarReceita(cpf.replace(/\D/g, ''));
      setDadosCPF(response.data);
      toast({
        title: "Consulta Realizada",
        description: "Dados da Receita Federal obtidos com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Consulta",
        description: error.message || "Erro ao consultar Receita Federal",
        variant: "destructive",
      });
    } finally {
      setLoadingCPF(false);
    }
  };

  const consultarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      toast({
        title: "CNPJ Inválido",
        description: "Digite um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoadingCNPJ(true);
    try {
      const response = await apiService.consultarReceitaCNPJ(cnpj.replace(/\D/g, ''));
      setDadosCNPJ(response.data);
      toast({
        title: "Consulta Realizada",
        description: "Dados da Receita Federal obtidos com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Consulta",
        description: error.message || "Erro ao consultar Receita Federal",
        variant: "destructive",
      });
    } finally {
      setLoadingCNPJ(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Consulta Receita Federal</h1>
        <p className="text-gray-600 mt-2">
          Consulte dados cadastrais de CPF e CNPJ na Receita Federal
        </p>
      </div>

      <Tabs defaultValue="cpf" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cpf">Consulta CPF</TabsTrigger>
          <TabsTrigger value="cnpj">Consulta CNPJ</TabsTrigger>
        </TabsList>

        <TabsContent value="cpf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta CPF</CardTitle>
              <CardDescription>
                Digite o CPF para consultar dados na Receita Federal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={consultarCPF} 
                    disabled={loadingCPF}
                    className="min-w-[120px]"
                  >
                    {loadingCPF ? "Consultando..." : "Consultar"}
                  </Button>
                </div>
              </div>

              {dadosCPF && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Dados da Receita Federal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome</Label>
                      <p className="text-lg">{dadosCPF.nome}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">CPF</Label>
                      <p className="text-lg">{dadosCPF.cpf}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Nascimento</Label>
                      <p className="text-lg">{new Date(dadosCPF.dataNascimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Situação Cadastral</Label>
                      <Badge variant={dadosCPF.situacaoCadastral === 'REGULAR' ? 'default' : 'destructive'}>
                        {dadosCPF.situacaoCadastral}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Inscrição</Label>
                      <p className="text-lg">{new Date(dadosCPF.dataInscricao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Óbito</Label>
                      <p className="text-lg">{dadosCPF.dataObito ? new Date(dadosCPF.dataObito).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>

                  {dadosCPF.endereco && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Endereço</Label>
                      <p className="text-lg">
                        {dadosCPF.endereco.logradouro}, {dadosCPF.endereco.bairro} - {dadosCPF.endereco.cidade}/{dadosCPF.endereco.uf} - CEP: {dadosCPF.endereco.cep}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Última Atualização</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(dadosCPF.ultimaAtualizacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cnpj" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta CNPJ</CardTitle>
              <CardDescription>
                Digite o CNPJ para consultar dados na Receita Federal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={consultarCNPJ} 
                    disabled={loadingCNPJ}
                    className="min-w-[120px]"
                  >
                    {loadingCNPJ ? "Consultando..." : "Consultar"}
                  </Button>
                </div>
              </div>

              {dadosCNPJ && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Dados da Receita Federal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Razão Social</Label>
                      <p className="text-lg">{dadosCNPJ.razaoSocial}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">CNPJ</Label>
                      <p className="text-lg">{dadosCNPJ.cnpj}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome Fantasia</Label>
                      <p className="text-lg">{dadosCNPJ.nomeFantasia}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Situação Cadastral</Label>
                      <Badge variant={dadosCNPJ.situacaoCadastral === 'ATIVA' ? 'default' : 'destructive'}>
                        {dadosCNPJ.situacaoCadastral}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Abertura</Label>
                      <p className="text-lg">{new Date(dadosCNPJ.dataAbertura).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Empresa</Label>
                      <p className="text-lg">{dadosCNPJ.tipoEmpresa}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Capital Social</Label>
                      <p className="text-lg">
                        R$ {dadosCNPJ.capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {dadosCNPJ.endereco && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Endereço</Label>
                      <p className="text-lg">
                        {dadosCNPJ.endereco.logradouro}, {dadosCNPJ.endereco.bairro} - {dadosCNPJ.endereco.cidade}/{dadosCNPJ.endereco.uf} - CEP: {dadosCNPJ.endereco.cep}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Última Atualização</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(dadosCNPJ.ultimaAtualizacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReceitaModule; 