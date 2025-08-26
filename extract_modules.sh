#!/bin/bash

COMMIT_HASH="2826b5128b81e386c176082ebb01c3efcc189c42"
BACKUP_DIR="backup_modules_jsx"

# Lista de arquivos JSX em src/modules
FILES=(
  "src/modules/AccountsPayableModule.jsx"
  "src/modules/Billing/hooks/useBillings.jsx"
  "src/modules/BillingModule.jsx"
  "src/modules/ChartOfAccounts/hooks/useChartOfAccounts.jsx"
  "src/modules/ChartOfAccountsModule.jsx"
  "src/modules/CostCenters/hooks/useCostCenters.jsx"
  "src/modules/CostCentersModule.jsx"
  "src/modules/Customers/CustomersModule.jsx"
  "src/modules/Dashboard/DashboardModule.jsx"
  "src/modules/Dashboard/components/ChartCard.jsx"
  "src/modules/Dashboard/components/KpiCard.jsx"
  "src/modules/Dashboard/components/LowStockTable.jsx"
  "src/modules/Dashboard/components/TopCustomersTable.jsx"
  "src/modules/DashboardModule.jsx"
  "src/modules/Financial/hooks/useFinancialDocuments.jsx"
  "src/modules/FinancialModule.jsx"
  "src/modules/IntegrationsModule.jsx"
  "src/modules/NFeModule.jsx"
  "src/modules/Partners/hooks/usePartners.jsx"
  "src/modules/Products/ProductsModule.jsx"
  "src/modules/Products/hooks/useProducts.jsx"
  "src/modules/ProfileModule.jsx"
  "src/modules/ReceitaModule.jsx"
  "src/modules/ReportsModule.jsx"
  "src/modules/Sales/hooks/useSales.jsx"
  "src/modules/SalesModule.jsx"
  "src/modules/Segments/SegmentsModule.jsx"
  "src/modules/Segments/hooks/useSegments.jsx"
  "src/modules/Suppliers/SuppliersModule.jsx"
  "src/modules/SuppliersModule.jsx"
)

# Criar diretórios necessários no backup
mkdir -p "$BACKUP_DIR/Billing/hooks"
mkdir -p "$BACKUP_DIR/ChartOfAccounts/hooks"
mkdir -p "$BACKUP_DIR/CostCenters/hooks"
mkdir -p "$BACKUP_DIR/Customers"
mkdir -p "$BACKUP_DIR/Dashboard/components"
mkdir -p "$BACKUP_DIR/Financial/hooks"
mkdir -p "$BACKUP_DIR/Partners/hooks"
mkdir -p "$BACKUP_DIR/Products/hooks"
mkdir -p "$BACKUP_DIR/Segments/hooks"
mkdir -p "$BACKUP_DIR/Suppliers"

# Extrair cada arquivo do commit e salvá-lo no diretório de backup
for file in "${FILES[@]}"; do
  # Criar o caminho de destino
  dest_file="$BACKUP_DIR/${file#src/modules/}"
  
  echo "Extraindo $file para $dest_file"
  
  # Extrair o arquivo do commit e salvá-lo
  git show "$COMMIT_HASH:$file" > "$dest_file" 2>/dev/null
  
  # Verificar se o arquivo foi extraído com sucesso
  if [ $? -eq 0 ]; then
    echo "✅ Arquivo extraído com sucesso: $dest_file"
  else
    echo "❌ Falha ao extrair arquivo: $file"
  fi
done

echo "\nBackup concluído! Os arquivos estão disponíveis em $BACKUP_DIR/"