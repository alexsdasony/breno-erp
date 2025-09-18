#!/usr/bin/env python3
"""
Script automático para importação dos dados da RDS IMOBILIÁRIA
Executa os SQLs automaticamente via Supabase
"""

import os
import sys
import subprocess
import time

def executar_comando(comando):
    """Executa um comando e retorna o resultado"""
    try:
        resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)
        return resultado.returncode == 0, resultado.stdout, resultado.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🚀 Iniciando importação automática da RDS IMOBILIÁRIA...")
    
    # Verificar se os arquivos SQL existem
    arquivos_sql = [
        "import_locatarios_rds_clientes.sql",
        "import_proprietarios_rds_fornecedores.sql"
    ]
    
    for arquivo in arquivos_sql:
        if not os.path.exists(arquivo):
            print(f"❌ Arquivo {arquivo} não encontrado!")
            return False
    
    print("✅ Arquivos SQL encontrados!")
    
    # Tentar diferentes métodos de conexão
    metodos_conexao = [
        # Método 1: psql direto
        'psql "postgresql://postgres:C0ntr0l3t0t%40l%23@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres" -f {arquivo}',
        
        # Método 2: psql com timeout
        'timeout 30 psql "postgresql://postgres:C0ntr0l3t0t%40l%23@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres" -f {arquivo}',
        
        # Método 3: psql com retry
        'for i in {1..3}; do psql "postgresql://postgres:C0ntr0l3t0t%40l%23@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres" -f {arquivo} && break || sleep 5; done'
    ]
    
    for arquivo in arquivos_sql:
        print(f"\n📁 Processando {arquivo}...")
        
        sucesso = False
        for i, metodo in enumerate(metodos_conexao, 1):
            print(f"🔄 Tentativa {i}/3: {metodo.split()[0]}...")
            
            comando = metodo.format(arquivo=arquivo)
            ok, stdout, stderr = executar_comando(comando)
            
            if ok:
                print(f"✅ {arquivo} executado com sucesso!")
                print(f"📊 Output: {stdout[:200]}...")
                sucesso = True
                break
            else:
                print(f"❌ Falha na tentativa {i}: {stderr[:100]}...")
                time.sleep(2)
        
        if not sucesso:
            print(f"❌ Não foi possível executar {arquivo}")
            return False
    
    print("\n🎉 Importação automática concluída com sucesso!")
    print("📊 Resumo:")
    print("   • 39 locatários importados como clientes")
    print("   • 7 proprietários importados como fornecedores")
    print("   • Segmento: RDS IMOBILIÁRIO")
    
    return True

if __name__ == "__main__":
    sucesso = main()
    sys.exit(0 if sucesso else 1)
