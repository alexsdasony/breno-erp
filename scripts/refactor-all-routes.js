#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.join(__dirname, '../app/api');

function findRouteFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findRouteFiles(fullPath));
    } else if (entry.name === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip se já foi refatorado
  if (content.includes("from '@/lib/getSupabaseAdmin'") && 
      content.includes("const supabaseAdmin = getSupabaseAdmin()")) {
    return false;
  }

  // 1. Adicionar dynamic no início
  if (!content.includes("export const dynamic = 'force-dynamic'")) {
    const firstLine = content.trim().split('\n')[0];
    if (firstLine.startsWith('import') || firstLine.startsWith('export')) {
      content = "export const dynamic = 'force-dynamic';\n\n" + content;
    } else {
      content = "export const dynamic = 'force-dynamic';\n" + content;
    }
    modified = true;
  }

  // 2. Substituir import
  if (content.includes("from '@/lib/supabaseAdmin'")) {
    content = content.replace(
      /import\s+{\s*supabaseAdmin\s*}\s+from\s+['"]@\/lib\/supabaseAdmin['"];?/g,
      "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';"
    );
    modified = true;
  }

  // 3. Substituir imports dinâmicos
  content = content.replace(
    /const\s+{\s*supabaseAdmin\s*}\s+=\s+await\s+import\(['"]@\/lib\/supabaseAdmin['"]\);/g,
    "const { getSupabaseAdmin } = await import('@/lib/getSupabaseAdmin');\n    const supabaseAdmin = getSupabaseAdmin();"
  );

  // 4. Remover função createAuditLog local
  const auditLogRegex = /\/\/\s*Função para criar log de auditoria\s*\nasync function createAuditLog\([^)]*\)\s*\{[\s\S]*?\n\}/g;
  if (auditLogRegex.test(content) && !content.includes("from '@/lib/createAuditLog'")) {
    content = content.replace(auditLogRegex, '');
    if (content.includes("from '@/lib/getSupabaseAdmin'")) {
      content = content.replace(
        /(import\s+{\s*getSupabaseAdmin\s*}\s+from\s+['"]@\/lib\/getSupabaseAdmin['"];?)/,
        "$1\nimport { createAuditLog } from '@/lib/createAuditLog';"
      );
    }
    modified = true;
  }

  // 5. Adicionar const supabaseAdmin = getSupabaseAdmin() em cada função que usa supabaseAdmin
  const funcRegex = /(export\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?)(\n\s*)(try\s*\{)/g;
  let match;
  const functions = [];
  while ((match = funcRegex.exec(content)) !== null) {
    functions.push({
      start: match.index,
      end: match.index + match[0].length,
      tryStart: match.index + match[1].length + match[2].length
    });
  }

  // Processar de trás para frente para não quebrar índices
  for (let i = functions.length - 1; i >= 0; i--) {
    const func = functions[i];
    const funcBody = content.slice(func.tryStart);
    const tryEnd = funcBody.indexOf('\n  }');
    const funcContent = funcBody.slice(0, tryEnd > 0 ? tryEnd : 1000);
    
    if (funcContent.includes('supabaseAdmin.') && 
        !funcContent.includes('getSupabaseAdmin()') &&
        !funcContent.includes('const supabaseAdmin = getSupabaseAdmin()')) {
      // Encontrar primeira linha após try {
      const firstLineMatch = funcContent.match(/^\s*(\S.*?)\n/);
      if (firstLineMatch) {
        const insertPos = func.tryStart + firstLineMatch[0].length;
        const indent = firstLineMatch[1].match(/^(\s*)/)?.[1] || '    ';
        content = content.slice(0, insertPos) + 
          `${indent}const supabaseAdmin = getSupabaseAdmin();\n` + 
          content.slice(insertPos);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const files = findRouteFiles(API_DIR);
  console.log(`📝 Processando ${files.length} rotas...\n`);

  let count = 0;
  for (const file of files) {
    try {
      if (refactorFile(file)) {
        count++;
        console.log(`✅ ${path.relative(API_DIR, file)}`);
      }
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`);
    }
  }

  console.log(`\n✅ ${count} rotas refatoradas.`);
}

main();
