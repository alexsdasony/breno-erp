import { subDays, format } from 'date-fns';

const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nelson', 'Olivia', 'Pedro', 'Quintino', 'Rafael', 'Sofia', 'Tiago', 'Ursula', 'Victor', 'Yasmin', 'Zeca'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Nunes'];
const productNames = ['Notebook Pro', 'Mouse Gamer', 'Teclado Mecânico', 'Monitor 4K', 'Cadeira Ergonômica', 'Webcam HD', 'Fone Bluetooth', 'SSD 1TB', 'Placa de Vídeo', 'Roteador Wi-Fi 6', 'Mesa Digitalizadora', 'Impressora Multifuncional', 'Projetor LED', 'HD Externo 2TB'];
const productCategories = ['Eletrônicos', 'Periféricos', 'Hardware', 'Mobiliário', 'Acessórios'];
const transactionDescriptions = {
  receita: ['Venda de Produtos', 'Serviços de Consultoria', 'Assinatura de Software', 'Suporte Técnico'],
  despesa: ['Compra de Estoque', 'Marketing Digital', 'Aluguel do Escritório', 'Salários', 'Contas de Consumo', 'Manutenção de Equipamentos', 'Fornecedores de Software']
};
const transactionCategories = ['Vendas', 'Serviços', 'Compras', 'Marketing', 'Administrativo', 'RH'];
const supplierNames = ['Fornecedor A', 'Distribuidora B', 'Importados C', 'Tech D', 'Logística E', 'Serviços F'];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysAgo) => format(subDays(new Date(), getRandomInt(0, daysAgo)), 'yyyy-MM-dd');

export const generateMockData = (segments = []) => {
  const mockData = {
    customers: [],
    products: [],
    sales: [],
    transactions: [],
    billings: [],
    accountsPayable: [],
    nfeList: [],
  };

  const getRandomSegmentId = () => segments.length > 0 ? getRandomItem(segments).id : null;

  for (let i = 1; i <= 30; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    mockData.customers.push({
      id: i,
      name: `${firstName} ${lastName}`,
      cpf: `${getRandomInt(100, 999)}.${getRandomInt(100, 999)}.${getRandomInt(100, 999)}-${getRandomInt(10, 99)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `(11) 9${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
      address: `Rua Fictícia, ${getRandomInt(1, 1000)}`,
      city: 'São Paulo',
      state: 'SP',
      totalPurchases: 0,
      lastPurchaseDate: null,
    });
  }

  for (let i = 1; i <= 20; i++) {
    mockData.products.push({
      id: i,
      name: `${getRandomItem(productNames)} Mk${getRandomInt(1, 5)}`,
      stock: getRandomInt(5, 150),
      minStock: getRandomInt(5, 20),
      price: parseFloat(getRandomNumber(50, 3000).toFixed(2)),
      category: getRandomItem(productCategories),
      segmentId: getRandomSegmentId(),
    });
  }

  for (let i = 1; i <= 250; i++) {
    const customer = getRandomItem(mockData.customers);
    const product = getRandomItem(mockData.products);
    const quantity = getRandomInt(1, 5);
    const total = parseFloat((product.price * quantity).toFixed(2));
    const date = getRandomDate(365);
    const status = getRandomItem(['Concluída', 'Pendente', 'Cancelada']);

    mockData.sales.push({
      id: i,
      customerId: customer.id,
      customerName: customer.name,
      product: product.name,
      quantity,
      total,
      date,
      status,
      segmentId: product.segmentId,
    });

    if (status === 'Concluída') {
      customer.totalPurchases += total;
      if (!customer.lastPurchaseDate || new Date(date) > new Date(customer.lastPurchaseDate)) {
        customer.lastPurchaseDate = date;
      }
    }
  }

  const costCenters = ['Administrativo', 'Vendas', 'Marketing', 'Estoque', 'Operacional'];
  for (let i = 1; i <= 300; i++) {
    const type = getRandomItem(['receita', 'despesa']);
    const date = getRandomDate(365);
    mockData.transactions.push({
      id: i,
      type,
      description: getRandomItem(transactionDescriptions[type]),
      amount: parseFloat(getRandomNumber(50, 5000).toFixed(2)),
      date,
      category: getRandomItem(transactionCategories),
      costCenter: type === 'despesa' ? getRandomItem(costCenters) : null,
      segmentId: getRandomSegmentId(),
    });
  }

  for (let i = 1; i <= 150; i++) {
    const customer = getRandomItem(mockData.customers);
    const dueDate = getRandomDate(-30); 
    const status = new Date(dueDate) < new Date() && Math.random() > 0.5 ? 'Vencida' : getRandomItem(['Paga', 'Pendente']);
    const paymentDate = status === 'Paga' ? getRandomDate(365) : null;
    mockData.billings.push({
      id: i,
      customerId: customer.id,
      customerName: customer.name,
      amount: parseFloat(getRandomNumber(100, 1500).toFixed(2)),
      dueDate,
      status,
      paymentDate,
      segmentId: getRandomSegmentId(),
    });
  }

  for (let i = 1; i <= 100; i++) {
    const dueDate = getRandomDate(-30);
    const status = new Date(dueDate) < new Date() && Math.random() > 0.5 ? 'overdue' : getRandomItem(['paid', 'pending']);
    mockData.accountsPayable.push({
      id: i,
      supplier: getRandomItem(supplierNames),
      description: getRandomItem(transactionDescriptions.despesa),
      amount: parseFloat(getRandomNumber(100, 2500).toFixed(2)),
      dueDate,
      status,
      segmentId: getRandomSegmentId(),
    });
  }
  
  const concludedSales = mockData.sales.filter(s => s.status === 'Concluída');
  for (let i = 1; i <= Math.min(100, concludedSales.length); i++) {
    const sale = concludedSales[i-1];
    mockData.nfeList.push({
      id: i,
      number: `000${i}`,
      customerName: sale.customerName,
      date: sale.date,
      total: sale.total,
      status: getRandomItem(['Emitida', 'Cancelada']),
      segmentId: sale.segmentId,
    });
  }

  return mockData;
};