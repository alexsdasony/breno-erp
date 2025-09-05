// Teste de validação de CPF
function validateCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
}

// Testar seu CPF
const cpf = '71737251272';
const cpfFormatted = '717.372.512-72';

console.log('🧪 TESTANDO VALIDAÇÃO DE CPF:\n');
console.log(`CPF: ${cpf} - ${validateCPF(cpf) ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
console.log(`CPF Formatado: ${cpfFormatted} - ${validateCPF(cpfFormatted) ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);

// Verificar se o problema pode estar na validação do tipo de contribuinte
console.log('\n🔍 Verificando se o problema pode estar no tipo de contribuinte:');
console.log('Para CPF, o tipo deve ser "PF" (Pessoa Física)');
console.log('Para CNPJ, o tipo deve ser "PJ" (Pessoa Jurídica)');
