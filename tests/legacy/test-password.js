import bcrypt from 'bcrypt';

async function testPassword() {
  const password = 'admin123';
  const hash = '$2b$12$5ddqnX7oXhY0PFWugVLtleJOIDq11.IlC1slxLoFD37WPKiu798Uu';
  
  console.log('🔍 Testando senha...');
  console.log('Senha:', password);
  console.log('Hash:', hash);
  
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Senha válida:', isValid);
    
    if (!isValid) {
      console.log('❌ Senha incorreta! Gerando novo hash...');
      const newHash = await bcrypt.hash(password, 12);
      console.log('Novo hash:', newHash);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

testPassword();
