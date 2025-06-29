import fetch from 'node-fetch';

class ChatProService {
  constructor() {
    this.instanceCode = 'chatpro-5rz8flbg7i';
    this.token = '975500d9794fa7180936bef32c13535c';
    this.baseUrl = `https://v5.chatpro.com.br/${this.instanceCode}`;
  }

  async sendMessage(phoneNumber, message) {
    try {
      // Formatar número de telefone (remover caracteres especiais e adicionar código do país)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const response = await fetch(`${this.baseUrl}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          number: formattedPhone,
          message: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ChatPro API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ ChatPro message sent:', data);
      return data;
    } catch (error) {
      console.error('❌ ChatPro send message error:', error);
      throw error;
    }
  }

  async sendPasswordResetMessage(phoneNumber, resetCode, userName) {
    const message = `🔐 *Breno ERP - Redefinição de Senha*

Olá ${userName}! 

Você solicitou a redefinição de senha para sua conta no Breno ERP.

🔄 *Código de Verificação:* ${resetCode}

⏰ Este código expira em 10 minutos.

⚠️ *Importante:* 
- Não compartilhe este código com ninguém
- Se você não solicitou esta redefinição, ignore esta mensagem

📧 Para continuar, use este código na tela de redefinição de senha.

Atenciosamente,
Equipe Breno ERP`;

    return this.sendMessage(phoneNumber, message);
  }

  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona +55 (Brasil)
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    // Adiciona o + no início
    return '+' + cleaned;
  }

  async validatePhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Validação básica: deve ter pelo menos 13 dígitos (+55 + DDD + número)
    return formatted.length >= 13;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`ChatPro status check failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ ChatPro connection test:', data);
      return data;
    } catch (error) {
      console.error('❌ ChatPro connection test failed:', error);
      throw error;
    }
  }
}

export default ChatProService; 