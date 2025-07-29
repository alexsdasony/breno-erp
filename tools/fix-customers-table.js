#!/usr/bin/env node
import { runArbitrarySQL } from '../backend/database/prodConfig.js';

const columns = [
  { name: 'data_atualizacao_endereco', type: 'DATE' },
  { name: 'endereco_declarado', type: 'BOOLEAN DEFAULT false' },
  { name: 'endereco_comprovado', type: 'BOOLEAN DEFAULT false' },
  { name: 'telefone_fixo', type: 'VARCHAR(30)' },
  { name: 'celular', type: 'VARCHAR(30)' },
  { name: 'valor_patrimonio', type: 'NUMERIC' },
  { name: 'nao_possui_patrimonio', type: 'BOOLEAN DEFAULT false' },
  { name: 'status_cadastro', type: "VARCHAR(30) DEFAULT 'Pendente'" },
  { name: 'responsavel_cadastro', type: 'VARCHAR(100)' },
  { name: 'profissao', type: 'VARCHAR(100)' },
  { name: 'pais', type: 'VARCHAR(100)' },
  { name: 'estado', type: 'VARCHAR(100)' },
  { name: 'cidade', type: 'VARCHAR(100)' },
  { name: 'grau_instrucao', type: 'VARCHAR(100)' },
  { name: 'estado_civil', type: 'VARCHAR(100)' },
  { name: 'data_nascimento', type: 'DATE' },
  { name: 'sexo', type: 'VARCHAR(10)' },
  { name: 'tipo_documento', type: 'VARCHAR(30)' },
  { name: 'data_emissao', type: 'DATE' },
  { name: 'numero_documento', type: 'VARCHAR(30)' },
  { name: 'data_validade', type: 'DATE' },
  { name: 'orgao_emissor', type: 'VARCHAR(30)' },
  { name: 'documento_image', type: 'TEXT' },
  { name: 'cnpj_origem_renda', type: 'VARCHAR(30)' },
  { name: 'data_admissao', type: 'DATE' },
  { name: 'cargo', type: 'VARCHAR(100)' },
  { name: 'renda_bruta', type: 'NUMERIC' },
  { name: 'salario_liquido', type: 'NUMERIC' },
  { name: 'valor_imposto_renda', type: 'NUMERIC' },
  { name: 'data_comprovacao', type: 'DATE' },
  { name: 'documento_renda_image', type: 'TEXT' },
  { name: 'cep', type: 'VARCHAR(20)' },
  { name: 'rua', type: 'VARCHAR(100)' },
  { name: 'bairro', type: 'VARCHAR(100)' },
  { name: 'numero_casa', type: 'VARCHAR(20)' },
  { name: 'tipo_imovel', type: 'VARCHAR(30)' }
];

async function getExistingColumns() {
  const result = await runArbitrarySQL(`SELECT column_name FROM information_schema.columns WHERE table_name = 'customers';`);
  return result.rows.map(r => r.column_name);
}

(async () => {
  try {
    const existing = await getExistingColumns();
    for (const col of columns) {
      if (!existing.includes(col.name)) {
        try {
          await runArbitrarySQL(`ALTER TABLE customers ADD COLUMN ${col.name} ${col.type};`);
          console.log(`✅ Coluna adicionada: ${col.name}`);
        } catch (err) {
          console.error(`❌ Erro ao adicionar ${col.name}:`, err.message);
        }
      } else {
        console.log(`ℹ️  Coluna já existe: ${col.name}`);
      }
    }
    console.log('Processo concluído.');
  } catch (err) {
    console.error('Erro geral:', err.message);
    process.exit(1);
  }
})(); 