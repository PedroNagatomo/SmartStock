import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatCurrency, formatDate } from "../utils/format";
import type { Product, Alert, SaleRecord, DemandForecast } from "../types";

// Tipos de relatório
export type ReportType = "estoque" | "vendas" | "alertas" | "forecast";

interface ReportOptions {
  title: string;
  filename: string;
  dateRange?: { start: string; end: string };
  category?: string;
}

// ===== GERADOR PDF =====
export function generatePDF(
  columns: string[],
  rows: any[][],
  options: ReportOptions,
) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho estilizado
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SmartStock", 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestão de Estoque", 14, 24);

  // Título do relatório
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, 14, 42);

  // Metadados
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const dataHora = new Date().toLocaleString("pt-BR");
  doc.text(`Gerado em: ${dataHora}`, 14, 50);
  if (options.dateRange) {
    doc.text(
      `Período: ${formatDate(options.dateRange.start)} a ${formatDate(options.dateRange.end)}`,
      14,
      55,
    );
  }

  // Tabela
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 60,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Rodapé em cada página
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} - SmartStock`,
        pageWidth - 30,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" },
      );
    },
  });

  doc.save(`${options.filename}.pdf`);
}

// ===== GERADOR EXCEL =====
export function generateExcel(
  columns: string[],
  rows: any[][],
  options: ReportOptions,
) {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);

  // Ajustar largura das colunas
  const colWidths = columns.map((col, i) => {
    const maxLength = Math.max(
      col.length,
      ...rows.map((row) => String(row[i] || "").length),
    );
    return { wch: Math.min(maxLength + 3, 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options.title.substring(0, 31),
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${options.filename}.xlsx`);
}

// ===== RELATÓRIOS ESPECÍFICOS =====

export function exportStockReport(
  products: Product[],
  format: "pdf" | "excel",
) {
  const columns = [
    "SKU",
    "Nome",
    "Categoria",
    "Estoque Atual",
    "Est. Mínimo",
    "Est. Máximo",
    "Preço Unitário",
    "Status",
  ];
  const rows = products.map((p) => [
    p.sku,
    p.name,
    p.category || "-",
    p.currentStock,
    p.minimumStock,
    p.maximumStock,
    formatCurrency(p.unitPrice),
    p.active ? "Ativo" : "Inativo",
  ]);

  const options: ReportOptions = {
    title: "Relatório de Estoque Atual",
    filename: `estoque-${new Date().toISOString().split("T")[0]}`,
  };

  if (format === "pdf") generatePDF(columns, rows, options);
  else generateExcel(columns, rows, options);
}

export function exportAlertsReport(alerts: Alert[], format: "pdf" | "excel") {
  const columns = [
    "SKU",
    "Produto",
    "Estoque",
    "Ponto Reposição",
    "Risco",
    "Dias p/ Ruptura",
    "Severidade",
    "Compra Sugerida",
  ];
  const rows = alerts.map((a) => [
    a.sku,
    a.productName,
    a.currentStock,
    a.reorderPoint,
    `${a.stockoutRisk.toFixed(0)}%`,
    a.daysUntilStockout,
    a.severity,
    a.suggestedOrder > 0 ? `${a.suggestedOrder} un.` : "-",
  ]);

  const options: ReportOptions = {
    title: "Relatório de Alertas de Estoque",
    filename: `alertas-${new Date().toISOString().split("T")[0]}`,
  };

  if (format === "pdf") generatePDF(columns, rows, options);
  else generateExcel(columns, rows, options);
}

export function exportSalesReport(
  sales: SaleRecord[],
  format: "pdf" | "excel",
  dateRange?: { start: string; end: string },
) {
  const columns = [
    "Data",
    "Produto",
    "SKU",
    "Quantidade",
    "Preço Unit.",
    "Total",
  ];
  const rows = sales.map((s) => [
    formatDate(s.saleDate),
    s.product.name,
    s.product.sku,
    s.quantity,
    formatCurrency(s.unitPrice),
    formatCurrency(s.totalValue || s.quantity * s.unitPrice),
  ]);

  const options: ReportOptions = {
    title: "Relatório de Vendas",
    filename: `vendas-${new Date().toISOString().split("T")[0]}`,
    dateRange,
  };

  if (format === "pdf") generatePDF(columns, rows, options);
  else generateExcel(columns, rows, options);
}

export function exportForecastReport(
  forecasts: DemandForecast[],
  products: Product[],
  format: "pdf" | "excel",
) {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const columns = [
    "SKU",
    "Produto",
    "Estoque",
    "Demanda Média",
    "Est. Segurança",
    "Ponto Reposição",
    "Compra Sugerida",
    "Risco",
  ];
  const rows = forecasts.map((f) => {
    const product = productMap.get(f.productId);
    return [
      product?.sku || "-",
      product?.name || "-",
      f.currentStock,
      f.averageDailyDemand.toFixed(1),
      f.safetyStock,
      f.reorderPoint,
      f.suggestedOrder,
      `${f.stockoutRisk.toFixed(0)}%`,
    ];
  });

  const options: ReportOptions = {
    title: "Relatório de Previsão de Demanda",
    filename: `previsao-demanda-${new Date().toISOString().split("T")[0]}`,
  };

  if (format === "pdf") generatePDF(columns, rows, options);
  else generateExcel(columns, rows, options);
}
