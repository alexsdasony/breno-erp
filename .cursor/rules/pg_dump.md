# Regra: Dump do banco PostgreSQL (Supabase) via pg_dump local

Sempre que for solicitado a realizar um dump/backup do banco de dados, utilize o binário pg_dump local indicado e siga o exemplo de comando abaixo.

- Binário a utilizar (Homebrew libpq):
  - `/usr/local/Cellar/libpq/17.5/bin/pg_dump`

- Exemplo real (copiado do ambiente do usuário):

```bash
/usr/local/Cellar/libpq/17.5/bin/pg_dump \
  --verbose \
  --host=db.qerubjitetqwfqqydhzv.supabase.co \
  --port=5432 \
  --username=postgres \
  --format=p \
  --clean \
  --create \
  --file /Users/moises/projects/databases-backups/breno_erp/dump-postgres-202508081903.sql \
  postgres
```

- Observações:
  - Ajuste somente `--host`, `--file` (caminho/nome) e, se necessário, o nome do banco ao final (aqui: `postgres`).
  - A senha deve ser fornecida via prompt (ou use `PGPASSWORD="sua_senha"` antes do comando).
  - Para Supabase, o SSL/TLS é requerido por padrão; o libpq já negociará automaticamente (não é necessário parâmetro adicional aqui).
  - Não altere flags padrão (`--format=p --clean --create`) a menos que explicitamente solicitado.

- Padrão de nomenclatura do arquivo:
  - `dump-postgres-YYYYMMDDHHMM.sql` dentro de `/Users/moises/projects/databases-backups/breno_erp/`.

Siga estritamente esta regra sempre que realizar dumps do banco neste projeto.

