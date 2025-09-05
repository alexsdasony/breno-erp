// Teste de validação de CNPJ
function validateCNPJ(cnpj) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cnpj[12]) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(cnpj[13]) === digit2;
}

// Testar CNPJs
const cnpjs = [
  '12.345.678/0001-90',
  '98.765.432/0001-10',
  '11.222.333/0001-44',
  '00.000.000/0001-00'
];

console.log('🧪 TESTANDO VALIDAÇÃO DE CNPJ:\n');

cnpjs.forEach(cnpj => {
  const isValid = validateCNPJ(cnpj);
  console.log(`CNPJ: ${cnpj} - ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
});

// CNPJ válido para teste
const validCNPJ = '11.222.333/0001-44';
console.log(`\n🎯 Usando CNPJ válido: ${validCNPJ} - ${validateCNPJ(validCNPJ) ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
