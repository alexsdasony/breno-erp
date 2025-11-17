'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, Wallet } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppData } from '@/hooks/useAppData';

declare global {
  interface Window {
    PluggyConnect?: any; // O Pluggy Connect pode ter diferentes estruturas
  }
}

interface PluggyConnectButtonProps {
  onSuccess?: (itemId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Componente para conectar contas bancárias via Pluggy Connect Widget
 * 
 * O widget Pluggy é carregado via script tag e permite que o usuário
 * conecte suas contas bancárias de forma segura.
 */
export default function PluggyConnectButton({ 
  onSuccess, 
  onError 
}: PluggyConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAppData();

  // Estado para controlar se o script está carregado
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  // Carregar o script do Pluggy Connect Widget
  React.useEffect(() => {
    // Verificar se o script já foi carregado
    if (window.PluggyConnect) {
      setScriptLoaded(true);
      return;
    }

    // Verificar se já existe um script carregando
    const existingScript = document.querySelector('script[src*="pluggy-connect"]');
    if (existingScript) {
      // Aguardar o script existente carregar
      existingScript.addEventListener('load', () => {
        setScriptLoaded(true);
      });
      return;
    }

    // Carregar o script do Pluggy Connect Widget
    const script = document.createElement('script');
    // URL correta do Pluggy Connect Widget
    script.src = 'https://cdn.pluggy.ai/pluggy-connect.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Pluggy Connect Widget carregado');
      console.log('🔍 PluggyConnect disponível:', window.PluggyConnect);
      console.log('🔍 Tipo:', typeof window.PluggyConnect);
      console.log('🔍 Propriedades:', Object.keys(window.PluggyConnect || {}));
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Erro ao carregar Pluggy Connect Widget');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o widget Pluggy',
        variant: 'destructive',
      });
    };

    document.body.appendChild(script);

    return () => {
      // Não remover o script ao desmontar, pois pode ser usado por outros componentes
    };
  }, []);

  const abrirPluggy = async () => {
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para conectar uma conta',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Obter connect token do backend
      const res = await fetch('/api/pluggy/connect-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Erro ao criar connect token (${res.status})`;
        
        // Mensagem mais amigável para credenciais não configuradas
        if (errorMessage.includes('Credenciais Pluggy não configuradas') || 
            errorMessage.includes('PLUGGY_CLIENT_ID') || 
            errorMessage.includes('PLUGGY_CLIENT_SECRET')) {
          const friendlyError = new Error('Integração Pluggy não está configurada no servidor. Por favor, configure as variáveis de ambiente PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET.');
          (friendlyError as any).isConfigError = true;
          throw friendlyError;
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      // A API pode retornar connectToken ou accessToken
      const connectToken = data.connectToken || data.accessToken;

      if (!connectToken) {
        console.error('❌ Resposta da API:', data);
        throw new Error('Connect token não retornado. Verifique as credenciais Pluggy.');
      }

      console.log('✅ Connect Token obtido:', connectToken.substring(0, 20) + '...');

      // 2. Aguardar o script carregar se necessário
      if (!scriptLoaded || !window.PluggyConnect) {
        // Tentar aguardar um pouco mais
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.PluggyConnect) {
          throw new Error('Pluggy Connect Widget não está disponível. Aguarde o carregamento do script.');
        }
      }

      // 3. PluggyConnect é uma classe, precisa ser instanciada com 'new'
      // Criar instância do PluggyConnect com as configurações
      const pluggyInstance = new window.PluggyConnect({
        connectToken,
        onSuccess: async (item: { id: string }) => {
          console.log('✅ Item conectado:', item.id);
          
          // Remover container do widget
          const widgetContainer = document.getElementById('pluggy-connect-widget-container');
          if (widgetContainer) {
            document.body.removeChild(widgetContainer);
          }
          
          setLoading(false);

          toast({
            title: 'Sucesso',
            description: `Conta conectada com sucesso! Item ID: ${item.id}`,
          });

          // Salvar o item no backend
          try {
            const saveRes = await fetch('/api/pluggy/items/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                itemId: item.id,
                userId: currentUser.id,
                segmentId: currentUser.segment_id || null,
              }),
            });

            if (!saveRes.ok) {
              console.warn('⚠️ Erro ao salvar item (não crítico):', await saveRes.text());
            } else {
              console.log('✅ Item salvo no banco de dados');
            }
          } catch (saveError) {
            console.warn('⚠️ Erro ao salvar item (não crítico):', saveError);
          }

          // Chamar callback de sucesso
          if (onSuccess) {
            onSuccess(item.id);
          }
        },
        onError: (error: any) => {
          console.error('❌ Erro no Pluggy Connect:', error);
          
          // Remover container do widget em caso de erro
          const widgetContainer = document.getElementById('pluggy-connect-widget-container');
          if (widgetContainer) {
            document.body.removeChild(widgetContainer);
          }
          
          setLoading(false);

          const errorMessage = error?.message || 'Erro ao conectar conta bancária';
          
          toast({
            title: 'Erro',
            description: errorMessage,
            variant: 'destructive',
          });

          if (onError) {
            onError(new Error(errorMessage));
          }
        },
        onClose: () => {
          // Callback quando o widget fecha
          console.log('🔒 Widget Pluggy fechado');
          const widgetContainer = document.getElementById('pluggy-connect-widget-container');
          if (widgetContainer) {
            document.body.removeChild(widgetContainer);
          }
          setLoading(false);
        },
      });

      // 4. Renderizar o widget
      // O Pluggy Connect usa Zoid e precisa de um container DOM para renderizar
      console.log('🔍 Métodos disponíveis na instância:', Object.keys(pluggyInstance));
      console.log('🔍 zoidComponent:', pluggyInstance.zoidComponent);
      
      // Criar container para o widget
      const container = document.createElement('div');
      container.id = 'pluggy-connect-widget-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '9999';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      document.body.appendChild(container);

      // O zoidComponent é uma função que retorna comp.init(props)
      // Precisamos chamá-la com as props corretas
      try {
        if (pluggyInstance.zoidComponent && typeof pluggyInstance.zoidComponent === 'function') {
          console.log('🔍 Chamando zoidComponent com props:', pluggyInstance.componentProps);
          
          // Chamar a função zoidComponent com as props que já estão configuradas
          // O Zoid geralmente renderiza automaticamente quando chamado
          const zoidResult = pluggyInstance.zoidComponent(pluggyInstance.componentProps);
          
          console.log('🔍 Resultado do zoidComponent:', zoidResult);
          console.log('🔍 Tipo do resultado:', typeof zoidResult);
          
          // Se retornar uma instância com métodos, tentar usar
          if (zoidResult) {
            if (typeof zoidResult.render === 'function') {
              zoidResult.render(container);
            } else if (typeof zoidResult.mount === 'function') {
              zoidResult.mount(container);
            } else if (typeof zoidResult.open === 'function') {
              zoidResult.open();
            } else if (typeof zoidResult === 'function') {
              // Se o resultado for uma função, pode ser que precise ser chamada
              zoidResult(container);
            }
          }
          
          // O Zoid pode renderizar automaticamente em um iframe
          // Verificar se um iframe foi criado
          setTimeout(() => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
              console.log('✅ Widget renderizado em iframe');
            } else {
              console.warn('⚠️ Nenhum iframe encontrado após renderização');
            }
          }, 1000);
        } else {
          console.error('❌ zoidComponent não é uma função');
          document.body.removeChild(container);
          setLoading(false);
          throw new Error('zoidComponent não está disponível');
        }
      } catch (renderError) {
        console.error('❌ Erro ao renderizar widget:', renderError);
        const widgetContainer = document.getElementById('pluggy-connect-widget-container');
        if (widgetContainer) {
          document.body.removeChild(widgetContainer);
        }
        setLoading(false);
        throw renderError;
      }

      // Adicionar timeout de segurança para evitar loading infinito
      const timeoutId = setTimeout(() => {
        const widgetContainer = document.getElementById('pluggy-connect-widget-container');
        if (widgetContainer && loading) {
          console.warn('⚠️ Widget não respondeu em 30 segundos, fechando...');
          document.body.removeChild(widgetContainer);
          setLoading(false);
          toast({
            title: 'Timeout',
            description: 'O widget Pluggy não respondeu. Tente novamente.',
            variant: 'destructive',
          });
        }
      }, 30000);

      // Limpar timeout quando componente desmontar ou widget fechar
      return () => {
        clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error('❌ Erro ao abrir Pluggy:', error);
      setLoading(false);

      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao conectar conta';
      
      // Detectar se é erro de configuração
      const isConfigError = error instanceof Error && 
        (errorMessage.includes('Credenciais Pluggy') || 
         errorMessage.includes('PLUGGY_CLIENT_ID') || 
         errorMessage.includes('PLUGGY_CLIENT_SECRET') ||
         errorMessage.includes('não está configurada') ||
         (error as any)?.isConfigError);

      toast({
        title: isConfigError ? 'Configuração necessária' : 'Erro',
        description: isConfigError 
          ? `${errorMessage}\n\nPor favor, configure as variáveis de ambiente PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no servidor.`
          : errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  return (
    <Button
      onClick={abrirPluggy}
      disabled={loading || !currentUser || !scriptLoaded}
      className="gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Link className="w-4 h-4" />
          Conectar Conta Bancária
        </>
      )}
    </Button>
  );
}
