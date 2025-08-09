#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA_DIR="$ROOT_DIR/supabase/schemas"
CURRENT_SCHEMA="$SCHEMA_DIR/current-schema.sql"
REMOTE_SCHEMA="$SCHEMA_DIR/remote-schema.sql"
REPORT_FILE="$SCHEMA_DIR/remote-vs-current-report.txt"

get_db_url() {
  local url=""
  if [[ -f "$ROOT_DIR/.env.local" ]]; then
    url="$(grep -E '^(DATABASE_URL|SUPABASE_DB_URL|DB_URL)=' "$ROOT_DIR/.env.local" | head -n1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" || true)"
  fi
  if [[ -z "$url" && -f "$ROOT_DIR/env.example" ]]; then
    url="$(grep -E '^(DATABASE_URL|SUPABASE_DB_URL|DB_URL)=' "$ROOT_DIR/env.example" | head -n1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" || true)"
  fi
  if [[ -z "$url" ]]; then
    echo "ERRO: DATABASE_URL não encontrado em .env.local ou env.example" >&2
    exit 2
  fi
  echo "$url"
}

canonize() {
  # Converte um arquivo SQL em linhas "tabela:coluna" ordenadas
  # Ignora constraints, índices e comentários
  awk '
    BEGIN { in_table=0; tbl="" }
    # início de uma tabela
    /^CREATE TABLE public\./ {
      in_table=1
      # extrair nome da tabela
      match($0, /CREATE TABLE public\.([a-zA-Z0-9_]+)/, m)
      tbl=m[1]
      next
    }
    # fim do bloco de colunas
    in_table==1 && /^\);/ { in_table=0; tbl=""; next }
    # linhas de coluna enquanto dentro da tabela
    in_table==1 {
      line=$0
      gsub(/^\s+|\s+$/, "", line)
      if (line=="" || line ~ /^--/ || line ~ /^CONSTRAINT/ || line ~ /^CREATE /) next
      # primeira palavra é o nome da coluna
      split(line, a, /[\t ]+/)
      col=a[1]
      # validar que começa com letra/underscore
      if (col ~ /^[a-zA-Z_][a-zA-Z0-9_]*$/) {
        print tbl ":" col
      }
    }
  ' | sort -u
}

main() {
  mkdir -p "$SCHEMA_DIR"
  local DB_URL
  DB_URL="$(get_db_url)"

  echo "Dumpando schema remoto para $REMOTE_SCHEMA ..."
  npx --yes supabase db dump --db-url "$DB_URL" --schema public --file "$REMOTE_SCHEMA" | cat

  echo "Gerando visão canônica..."
  canonize "$CURRENT_SCHEMA" > "$SCHEMA_DIR/current.canon.txt"
  canonize "$REMOTE_SCHEMA" > "$SCHEMA_DIR/remote.canon.txt"

  echo "Comparando..."
  if diff -u "$SCHEMA_DIR/current.canon.txt" "$SCHEMA_DIR/remote.canon.txt" > "$REPORT_FILE" 2>&1; then
    echo "OK: Schemas equivalentes no nível tabela:coluna" | tee -a "$REPORT_FILE"
    exit 0
  else
    echo "Diferenças detectadas. Veja $REPORT_FILE" >&2
    exit 1
  fi
}

main "$@"
