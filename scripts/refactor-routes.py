#!/usr/bin/env python3
"""
Script para refatorar todas as rotas API para usar getSupabaseAdmin() no runtime.
"""

import os
import re
import sys
from pathlib import Path

API_DIR = Path(__file__).parent.parent / "app" / "api"

def refactor_file(file_path: Path) -> bool:
    """Refatora um arquivo route.ts"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        modified = False

        # 1. Adicionar export const dynamic = 'force-dynamic' no início
        if "export const dynamic = 'force-dynamic'" not in content:
            # Encontrar primeira linha que não seja comentário ou vazia
            lines = content.split('\n')
            insert_pos = 0
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
                    insert_pos = i
                    break
            
            lines.insert(insert_pos, "export const dynamic = 'force-dynamic';")
            if insert_pos > 0:
                lines.insert(insert_pos + 1, "")
            content = '\n'.join(lines)
            modified = True

        # 2. Substituir import de supabaseAdmin
        if "from '@/lib/supabaseAdmin'" in content or 'from "@/lib/supabaseAdmin"' in content:
            # Remover linha de import antiga
            content = re.sub(
                r"import\s+{\s*supabaseAdmin\s*}\s+from\s+['\"]@/lib/supabaseAdmin['\"];?\s*\n",
                "",
                content
            )
            
            # Adicionar novo import se não existir
            if "from '@/lib/getSupabaseAdmin'" not in content:
                # Encontrar onde inserir (após dynamic ou após outros imports)
                if "from '@/lib/getSupabaseAdmin'" not in content:
                    # Inserir após dynamic ou após primeiro import
                    match = re.search(r"(export const dynamic = 'force-dynamic';\s*\n)", content)
                    if match:
                        pos = match.end()
                        content = content[:pos] + "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\n" + content[pos:]
                    else:
                        # Inserir no início após dynamic
                        match = re.search(r"(export const dynamic = 'force-dynamic';\s*\n\s*\n)", content)
                        if match:
                            pos = match.end()
                            content = content[:pos] + "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\n" + content[pos:]
                        else:
                            # Último recurso: inserir antes do primeiro export async
                            match = re.search(r"(export async function)", content)
                            if match:
                                pos = match.start()
                                content = content[:pos] + "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\n\n" + content[pos:]
            modified = True

        # 3. Substituir imports dinâmicos
        content = re.sub(
            r"const\s+{\s*supabaseAdmin\s*}\s+=\s+await\s+import\(['\"]@/lib/supabaseAdmin['\"]\);",
            "const { getSupabaseAdmin } = await import('@/lib/getSupabaseAdmin');\n    const supabaseAdmin = getSupabaseAdmin();",
            content
        )

        # 4. Remover função createAuditLog local e adicionar import
        audit_log_pattern = r"//\s*Função para criar log de auditoria\s*\nasync function createAuditLog\([^)]*\)\s*\{[^}]*\{[^}]*\{[^}]*\}[^}]*\}[^}]*\}"
        if re.search(audit_log_pattern, content, re.DOTALL) and "from '@/lib/createAuditLog'" not in content:
            content = re.sub(audit_log_pattern, "", content, flags=re.DOTALL)
            # Adicionar import
            if "from '@/lib/getSupabaseAdmin'" in content:
                content = content.replace(
                    "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';",
                    "import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';\nimport { createAuditLog } from '@/lib/createAuditLog';"
                )
            modified = True

        # 5. Adicionar const supabaseAdmin = getSupabaseAdmin() no início de cada função
        # Padrão: export async function NOME(...) { ... supabaseAdmin. ...
        func_pattern = r"(export\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*?)(\n\s*)(?=.*?supabaseAdmin\.)"
        
        def add_supabase_admin(match):
            func_start = match.group(1)
            indent = match.group(2)
            # Verificar se já tem getSupabaseAdmin() nesta função
            func_body_start = match.end()
            # Encontrar primeira linha não vazia dentro da função
            remaining = content[func_body_start:]
            first_line_match = re.search(r'^\s*(\w+.*?)\n', remaining, re.MULTILINE)
            if first_line_match and 'getSupabaseAdmin()' not in remaining[:remaining.find('supabaseAdmin.')]:
                return func_start + indent + "const supabaseAdmin = getSupabaseAdmin();\n" + indent
            return match.group(0)
        
        # Versão mais simples: adicionar após primeira linha dentro da função
        functions = re.finditer(r"export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*\{", content)
        for match in list(functions):
            func_start = match.end()
            func_body = content[func_start:]
            # Encontrar primeira linha não vazia
            first_line = re.search(r'^\s*(\S.*?)\n', func_body, re.MULTILINE)
            if first_line and 'supabaseAdmin.' in func_body and 'getSupabaseAdmin()' not in func_body[:func_body.find('supabaseAdmin.')]:
                insert_pos = func_start + first_line.end()
                indent = first_line.group(1)[:len(first_line.group(1)) - len(first_line.group(1).lstrip())]
                if not indent:
                    indent = "    "  # Default 4 spaces
                content = content[:insert_pos] + f"{indent}const supabaseAdmin = getSupabaseAdmin();\n" + content[insert_pos:]
                modified = True
                break  # Refazer busca após modificação

        if modified and content != original:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"❌ Erro ao processar {file_path}: {e}", file=sys.stderr)
        return False

def main():
    route_files = list(API_DIR.rglob("route.ts"))
    print(f"📝 Encontradas {len(route_files)} rotas para refatorar...\n")
    
    refactored = 0
    for file_path in route_files:
        if refactor_file(file_path):
            refactored += 1
            rel_path = file_path.relative_to(Path(__file__).parent.parent)
            print(f"✅ {rel_path}")
    
    print(f"\n✅ {refactored} rotas refatoradas de {len(route_files)} total.")

if __name__ == "__main__":
    main()
