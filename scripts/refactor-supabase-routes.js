#!/usr/bin/env node

/**
 * Script para refatorar todas as rotas API para usar getSupabaseAdmin() no runtime
 * em vez de importar supabaseAdmin global.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const API_ROUTES_DIR = path.join(__dirname, '../app/api');

async function refactorRoute(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Adicionar export const dynamic = 'force-dynamic' no início (se não existir)
  if (!content.includes("export const dynamic = 'force-dynamic'")) {
    // Encontrar onde começa o primeiro import ou export
    const firstImportMatch = content.match(/^(import|export)/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + 
        "export const dynamic = 'force-dynamic';\n\n" + 
        content.slice(insertPos);
      modified = true;
    }
  }

  // 2. Substituir import de supabaseAdmin
  if (content.includes("from '@/lib/supabaseAdmin'") || content.includes('from "@/lib/supabaseAdmin"')) {
    // Remover linha de import antiga
    content = content.replace(/import\s+{\s*supabaseAdmin\s*}\s+from\s+['"]@\/lib\/supabaseAdmin['"];?\s*\n/g, '');
    
    // Adicionar novo import se não existir
    if (!content.includes("from '@/lib/getSupabaseAdmin'")) {
      const importMatch = content.match(/^(import\s+.*?from\s+['"]@\/.*?['"];?\s*\n)/m);
      if (importMatch) {
        const insertPos = importMatch.index + importMatch[0].length;
        content = content.slice(0, insertPos) + 
          "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\n" + 
          content.slice(insertPos);
      } else {
        // Se não há imports, adicionar após dynamic
        const dynamicMatch = content.match(/export const dynamic = 'force-dynamic';\s*\n/);
        if (dynamicMatch) {
          const insertPos = dynamicMatch.index + dynamicMatch[0].length;
          content = content.slice(0, insertPos) + 
            "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\n" + 
            content.slice(insertPos);
        }
      }
    }
    modified = true;
  }

  // 3. Substituir imports dinâmicos de supabaseAdmin
  content = content.replace(
    /const\s+{\s*supabaseAdmin\s*}\s+=\s+await\s+import\(['"]@\/lib\/supabaseAdmin['"]\);/g,
    "const { getSupabaseAdmin } = await import('@/lib/getSupabaseAdmin');\n    const supabaseAdmin = getSupabaseAdmin();"
  );

  // 4. Remover função createAuditLog local e adicionar import do helper
  const auditLogMatch = content.match(/\/\/\s*Função para criar log de auditoria\s*\nasync function createAuditLog\([^)]*\)\s*\{[\s\S]*?\n\}/);
  if (auditLogMatch && !content.includes("from '@/lib/createAuditLog'")) {
    content = content.replace(auditLogMatch[0], '');
    // Adicionar import
    if (content.includes("from '@/lib/getSupabaseAdmin'")) {
      content = content.replace(
        /(import\s+{\s*getSupabaseAdmin\s*}\s+from\s+['"]@\/lib\/getSupabaseAdmin['"];?)/,
        "$1\nimport { createAuditLog } from '@/lib/createAuditLog';"
      );
    }
    modified = true;
  }

  // 5. Adicionar const supabaseAdmin = getSupabaseAdmin() no início de cada função export async
  const functionRegex = /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1];
    const funcStart = match.index + match[0].length;
    
    // Verificar se já tem getSupabaseAdmin() nesta função
    const funcBody = content.slice(funcStart);
    const funcEnd = funcBody.indexOf('\n}');
    const funcContent = funcBody.slice(0, funcEnd > 0 ? funcEnd : funcBody.length);
    
    // Se a função usa supabaseAdmin mas não cria o client
    if (funcContent.includes('supabaseAdmin') && !funcContent.includes('getSupabaseAdmin()')) {
      // Encontrar primeira linha não vazia dentro da função
      const firstLineMatch = funcContent.match(/^\s*(\w+.*?)\n/);
      if (firstLineMatch) {
        const insertPos = funcStart + funcContent.indexOf(firstLineMatch[0]) + firstLineMatch[0].length;
        const indent = firstLineMatch[0].match(/^(\s*)/)[1];
        content = content.slice(0, insertPos) + 
          `${indent}const supabaseAdmin = getSupabaseAdmin();\n` + 
          content.slice(insertPos);
        modified = true;
        // Re-executar regex para pegar próxima função
        functionRegex.lastIndex = 0;
        break;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  const routeFiles = await glob('**/route.ts', { 
    cwd: API_ROUTES_DIR,
    absolute: true 
  });

  console.log(`📝 Encontradas ${routeFiles.length} rotas para refatorar...\n`);

  let refactored = 0;
  for (const file of routeFiles) {
    try {
      const wasModified = await refactorRoute(file);
      if (wasModified) {
        refactored++;
        console.log(`✅ ${path.relative(API_ROUTES_DIR, file)}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao refatorar ${file}:`, error.message);
    }
  }

  console.log(`\n✅ ${refactored} rotas refatoradas de ${routeFiles.length} total.`);
}

main().catch(console.error);
