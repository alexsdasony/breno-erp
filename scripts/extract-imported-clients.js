import fs from 'fs';
import path from 'path';

// Função para extrair dados dos arquivos SQL
function extractClientsFromSQL(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const clients = [];
    
    // Regex para encontrar os dados dos clientes
    const clientRegex = /-- \d+\. (.+?)\n\(\s*'(.+?)',\s*'(.+?)',\s*'(.+?)',/g;
    let match;
    
    while ((match = clientRegex.exec(content)) !== null) {
      const [, comment, name, tipo_pessoa, tax_id] = match;
      clients.push({
        name: name.trim(),
        tipo_pessoa: tipo_pessoa.trim(),
        tax_id: tax_id.trim(),
        source: path.basename(filePath)
      });
    }
    
    return clients;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    return [];
  }
}

// Extrair dados de todos os arquivos SQL
const sqlFiles = [
  'import_clientes_arn_advogados.sql',
  'import_clientes_nauru.sql', 
  'import_clientes_rds_imobiliaria_fixed.sql'
];

let allClients = [];

sqlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📄 Processando ${file}...`);
    const clients = extractClientsFromSQL(file);
    allClients = allClients.concat(clients);
    console.log(`   Encontrados ${clients.length} clientes`);
  } else {
    console.log(`⚠️  Arquivo ${file} não encontrado`);
  }
});

console.log(`\n📊 Total de clientes importados: ${allClients.length}`);

// Gerar arquivo JSON com os dados
const outputFile = 'imported-clients-data.json';
fs.writeFileSync(outputFile, JSON.stringify(allClients, null, 2));
console.log(`💾 Dados salvos em ${outputFile}`);

// Mostrar alguns exemplos
console.log('\n📋 Exemplos de clientes encontrados:');
allClients.slice(0, 5).forEach((client, index) => {
  console.log(`${index + 1}. ${client.name} (${client.tax_id}) - ${client.source}`);
});
