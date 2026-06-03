import { formatMoney } from "@/lib/utils";

type ReportForPdf = {
  summary: {
    totalRevenue: number;
    netProfit: number;
    currentBalance: number;
    profitStatus: string;
  };
  rows: { section: string; label: string; note: string; amount: number }[];
};

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function moneyForPdf(value: number) {
  return formatMoney(value).replace("BDT", "BDT ");
}

function chunkText(value: string, maxLength = 74) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function buildPdf(title: string, lines: string[]) {
  const pages: string[][] = [];
  const pageLines = 38;
  for (let index = 0; index < lines.length; index += pageLines) {
    pages.push(lines.slice(index, index + pageLines));
  }

  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const firstPageId = 3;

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  const pageIds = pages.map((_, index) => firstPageId + index * 2);
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  pages.forEach((page, pageIndex) => {
    const pageId = firstPageId + pageIndex * 2;
    const contentId = pageId + 1;
    let stream = "BT\n/F1 12 Tf\n50 780 Td\n";
    stream += `(${pdfEscape(title)}) Tj\n0 -24 Td\n`;
    page.forEach((line) => {
      stream += `(${pdfEscape(line)}) Tj\n0 -18 Td\n`;
    });
    stream += "ET";

    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function downloadReportPdf(report: ReportForPdf, options: { type: string; from: string; to: string }) {
  const title = "Business Finance Dashboard - Financial Report";
  const lines = [
    `Report Type: ${options.type}`,
    `Date Range: ${options.from} to ${options.to}`,
    "",
    `Total Revenue: ${moneyForPdf(report.summary.totalRevenue)}`,
    `Net Profit/Loss: ${moneyForPdf(report.summary.netProfit)}`,
    `Current Balance: ${moneyForPdf(report.summary.currentBalance)}`,
    `Profit Status: ${report.summary.profitStatus}`,
    "",
    "Rows:",
  ];

  report.rows.forEach((row, index) => {
    const rowLines = chunkText(`${index + 1}. ${row.section} | ${row.label} | ${row.note} | ${moneyForPdf(row.amount)}`);
    lines.push(...rowLines);
  });

  const blob = new Blob([buildPdf(title, lines)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `business-finance-report-${options.from}-to-${options.to}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
