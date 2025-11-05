import jsPDF from 'jspdf';

interface ReportData {
  title: string;
  period: string;
  data: any;
}

export function generateReportPDF(reportData: ReportData, reportContent: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Cores
  const primaryColor = [102, 126, 234]; // #667eea
  const textColor = [51, 51, 51];
  const mutedColor = [102, 102, 102];
  const lightGray = [245, 245, 245];

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num || 0);
  };

  // Cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  yPosition = 25;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(reportData.title, maxWidth);
  doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += titleLines.length * 7 + 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${reportData.period}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition = 55;

  // Processar dados do relatório
  const data = reportData.data;
  
  // Adicionar estatísticas principais
  if (data.inflows !== undefined || data.outflows !== undefined || data.balance !== undefined) {
    // Relatório de Fluxo de Caixa
    checkPageBreak(40);
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro', margin, yPosition);
    yPosition += 10;
    
    const stats = [
      { label: 'Entradas', value: formatCurrency(data.inflows || 0), color: [34, 197, 94] },
      { label: 'Saídas', value: formatCurrency(Math.abs(data.outflows || 0)), color: [239, 68, 68] },
      { label: 'Saldo', value: formatCurrency(data.balance || 0), color: (data.balance || 0) >= 0 ? [34, 197, 94] : [239, 68, 68] }
    ];
    
    const cardWidth = (maxWidth - 10) / 3;
    let currentX = margin;
    
    stats.forEach((stat, index) => {
      if (index > 0 && index % 3 === 0) {
        yPosition += 30;
        currentX = margin;
        checkPageBreak(30);
      }
      
      // Card background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(currentX, yPosition, cardWidth, 25, 'F');
      
      // Valor
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      const valueLines = doc.splitTextToSize(stat.value, cardWidth - 10);
      doc.text(valueLines, currentX + 5, yPosition + 12);
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(stat.label, currentX + 5, yPosition + 20);
      
      currentX += cardWidth + 5;
    });
    
    yPosition += 35;
  } else if (data.totalRevenue !== undefined || data.totalSales !== undefined) {
    // Relatório de Performance/Vendas
    checkPageBreak(40);
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo de Vendas', margin, yPosition);
    yPosition += 10;
    
    const stats = [];
    if (data.totalRevenue !== undefined) {
      stats.push({ label: 'Receita Total', value: formatCurrency(data.totalRevenue) });
    }
    if (data.totalSales !== undefined) {
      stats.push({ label: 'Total de Vendas', value: data.totalSales.toString() });
    }
    if (data.averageTicket !== undefined) {
      stats.push({ label: 'Ticket Médio', value: formatCurrency(data.averageTicket) });
    }
    if (data.growth !== undefined) {
      stats.push({ label: 'Crescimento', value: `${data.growth.toFixed(2)}%` });
    }
    
    const colsPerRow = 2;
    const cardWidth = (maxWidth - 5) / colsPerRow;
    let currentX = margin;
    
    stats.forEach((stat, index) => {
      if (index > 0 && index % colsPerRow === 0) {
        yPosition += 30;
        currentX = margin;
        checkPageBreak(30);
      }
      
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(currentX, yPosition, cardWidth, 25, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const valueLines = doc.splitTextToSize(stat.value, cardWidth - 10);
      doc.text(valueLines, currentX + 5, yPosition + 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(stat.label, currentX + 5, yPosition + 20);
      
      currentX += cardWidth + 5;
    });
    
    yPosition += 35;
  } else if (data.customers && Array.isArray(data.customers)) {
    // Lista de clientes
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clientes', margin, yPosition);
    yPosition += 10;
    
    // Cabeçalho da tabela
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Nome', 'Email', 'Telefone', 'Status'];
    const colWidths = [maxWidth * 0.35, maxWidth * 0.35, maxWidth * 0.15, maxWidth * 0.15];
    let xPos = margin;
    
    headers.forEach((header, index) => {
      doc.rect(xPos, yPosition, colWidths[index], 8, 'F');
      doc.text(header, xPos + 2, yPosition + 6);
      xPos += colWidths[index];
    });
    
    yPosition += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Dados
    data.customers.slice(0, 30).forEach((customer: any) => {
      checkPageBreak(8);
      
      xPos = margin;
      const row = [
        customer.name || 'N/A',
        customer.email || 'N/A',
        customer.phone || 'N/A',
        customer.status === 'active' ? 'Ativo' : 'Inativo'
      ];
      
      row.forEach((cell, index) => {
        const cellText = doc.splitTextToSize(cell, colWidths[index] - 4);
        doc.text(cellText, xPos + 2, yPosition + 6);
        xPos += colWidths[index];
      });
      
      yPosition += 8;
    });
    
    yPosition += 10;
  } else if (data.suppliers && Array.isArray(data.suppliers)) {
    // Lista de fornecedores
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fornecedores', margin, yPosition);
    yPosition += 10;
    
    const headers = ['Nome', 'Email', 'Telefone', 'Status'];
    const colWidths = [maxWidth * 0.35, maxWidth * 0.35, maxWidth * 0.15, maxWidth * 0.15];
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let xPos = margin;
    headers.forEach((header, index) => {
      doc.rect(xPos, yPosition, colWidths[index], 8, 'F');
      doc.text(header, xPos + 2, yPosition + 6);
      xPos += colWidths[index];
    });
    
    yPosition += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    data.suppliers.slice(0, 30).forEach((supplier: any) => {
      checkPageBreak(8);
      
      xPos = margin;
      const row = [
        supplier.name || 'N/A',
        supplier.email || 'N/A',
        supplier.phone || 'N/A',
        supplier.status === 'active' ? 'Ativo' : 'Inativo'
      ];
      
      row.forEach((cell, index) => {
        const cellText = doc.splitTextToSize(cell, colWidths[index] - 4);
        doc.text(cellText, xPos + 2, yPosition + 6);
        xPos += colWidths[index];
      });
      
      yPosition += 8;
    });
    
    yPosition += 10;
  } else if (data.segments && Array.isArray(data.segments)) {
    // Segmentação de clientes
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Segmentação de Clientes', margin, yPosition);
    yPosition += 10;
    
    data.segments.forEach((segment: any) => {
      checkPageBreak(15);
      
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, maxWidth, 12, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(segment.name || 'Sem Nome', margin + 5, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(`${segment.count || 0} clientes`, pageWidth - margin - 30, yPosition + 8);
      
      yPosition += 15;
    });
  }

  // Adicionar informações adicionais se disponíveis
  if (data.summary) {
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    
    if (data.summary.totalSales !== undefined) {
      doc.text(`Total de vendas: ${data.summary.totalSales}`, margin, yPosition);
      yPosition += 6;
    }
    if (data.summary.totalCustomers !== undefined) {
      doc.text(`Total de clientes: ${data.summary.totalCustomers}`, margin, yPosition);
      yPosition += 6;
    }
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Baixar PDF
  const fileName = `relatorio_${reportData.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}


