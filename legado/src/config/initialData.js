
import { generateMockData } from '@/utils/mockDataGenerator';

const segments = [
  { id: 1, name: 'Comércio', description: 'Venda de produtos físicos.' },
  { id: 2, name: 'Serviços', description: 'Prestação de serviços e consultoria.' },
  { id: 3, name: 'Saúde', description: 'Clínicas, consultórios e serviços de saúde.' },
];

const generatedData = generateMockData(segments);

export const initialData = {
  ...generatedData,
  segments,
  costCenters: [
    { id: 1, name: 'Administrativo', segmentId: 1 },
    { id: 2, name: 'Vendas', segmentId: 1 },
    { id: 3, name: 'Marketing', segmentId: 2 },
    { id: 4, name: 'Estoque', segmentId: 1 },
    { id: 5, name: 'Operacional', segmentId: 2 }
  ],
  integrations: {
    imobzi: { apiKey: '', enabled: false }
  },
  users: [
    { id: 0, name: 'Admin ERP Pro', email: 'admin@erppro.com', password: 'admin123', role: 'admin', segmentId: null }
  ],
};
