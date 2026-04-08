import type { CommissionType, CompanyOption, ProfitabilityFilter } from "@/types";

export const STORAGE_KEYS = {
  milePrices: "calculadora-milhas:mile-prices",
  options: "calculadora-milhas:options",
  quickCalculator: "calculadora-milhas:quick-calculator",
  filters: "calculadora-milhas:filters",
  history: "calculadora-milhas:history",
} as const;

export const COMPANY_OPTIONS: CompanyOption[] = [
  {
    key: "smiles",
    label: "Smiles / Gol",
    description: "Ajuste o valor usado para emissões feitas pela Smiles.",
  },
  {
    key: "latam",
    label: "LATAM Pass",
    description: "Base de custo para cenários emitidos via LATAM Pass.",
  },
  {
    key: "azul",
    label: "Azul Fidelidade",
    description: "Valor do milheiro usado para emissões da Azul.",
  },
  {
    key: "outro",
    label: "Outra",
    description: "Use para qualquer programa adicional ou cenário manual.",
  },
];

export const COMMISSION_TYPE_OPTIONS: Array<{
  value: CommissionType;
  label: string;
  helper: string;
}> = [
  {
    value: "fixed",
    label: "Comissão fixa",
    helper: "Valor em reais descontado do lucro bruto.",
  },
  {
    value: "percent",
    label: "Comissão percentual",
    helper: "Percentual aplicado sobre a venda final.",
  },
];

export const PROFITABILITY_OPTIONS: Array<{
  value: ProfitabilityFilter;
  label: string;
}> = [
  { value: "all", label: "Todas" },
  { value: "profitable", label: "Apenas lucrativas" },
  { value: "loss", label: "Apenas com prejuízo" },
];
