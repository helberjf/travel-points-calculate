import { formatBRL, formatDateTime, formatMiles, formatPercent } from "@/lib/formatters";
import type { CalculatedFlightOption, HistorySnapshot } from "@/types";

function escapeCsvValue(value: string | number): string {
  const normalized = String(value).replaceAll('"', '""');
  return `"${normalized}"`;
}

function downloadCsv(filename: string, rows: string[][]): void {
  if (typeof window === "undefined") {
    return;
  }

  const csv = rows.map((row) => row.map(escapeCsvValue).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function exportOptionsToCSV(options: CalculatedFlightOption[]): void {
  const rows: string[][] = [
    [
      "nome",
      "companhia",
      "milhas",
      "valor do milheiro",
      "custo das milhas",
      "taxa",
      "custo total",
      "venda",
      "tipo de comissão",
      "comissão informada",
      "comissão em reais",
      "lucro bruto",
      "lucro líquido",
      "margem bruta",
      "margem líquida",
      "venda mínima",
    ],
    ...options.map((option) => [
      option.name,
      option.companyLabel,
      formatMiles(option.miles),
      formatBRL(option.milePrice),
      formatBRL(option.milesCost),
      formatBRL(option.cashAmount),
      formatBRL(option.totalCost),
      formatBRL(option.saleAmount),
      option.commissionType === "fixed" ? "fixa" : "percentual",
      option.commissionType === "fixed"
        ? formatBRL(option.commissionValue)
        : formatPercent(option.commissionValue),
      formatBRL(option.commissionAmount),
      formatBRL(option.grossProfit),
      formatBRL(option.netProfit),
      formatPercent(option.grossMargin),
      formatPercent(option.netMargin),
      formatBRL(option.breakevenSale),
    ]),
  ];

  downloadCsv("opcoes-calculadora-milhas.csv", rows);
}

export function exportHistoryToCSV(history: HistorySnapshot[]): void {
  const rows: string[][] = [
    [
      "id do snapshot",
      "nome do snapshot",
      "data/hora",
      "quantidade de opções",
      "melhor opção",
      "lucro líquido total",
      "margem líquida média",
    ],
    ...history.map((snapshot) => [
      snapshot.id,
      snapshot.name,
      formatDateTime(snapshot.createdAt),
      String(snapshot.summary.optionsCount),
      snapshot.summary.bestOptionName ?? "Sem opções",
      formatBRL(snapshot.summary.totalNetProfit),
      formatPercent(snapshot.summary.averageNetMargin),
    ]),
  ];

  downloadCsv("historico-calculadora-milhas.csv", rows);
}
