export type CompanyKey = "smiles" | "latam" | "azul" | "outro";

export type CompanyOption = {
  key: CompanyKey;
  label: string;
  description: string;
};

export type MilePrices = Record<CompanyKey, number>;

export type CommissionType = "fixed" | "percent";

export type FlightOption = {
  id: string;
  name: string;
  company: CompanyKey;
  miles: number;
  cashAmount: number;
  saleAmount: number;
  commissionType: CommissionType;
  commissionValue: number;
};

export type CalculatedFlightOption = FlightOption & {
  companyLabel: string;
  milePrice: number;
  milesCost: number;
  totalCost: number;
  grossProfit: number;
  commissionAmount: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  breakevenSale: number;
};

export type QuickCalculatorState = {
  company: CompanyKey;
  miles: number;
  cashAmount: number;
  saleAmount: number;
  commissionType: CommissionType;
  commissionValue: number;
};

export type ProfitabilityFilter = "all" | "profitable" | "loss";

export type FilterState = {
  company: CompanyKey | "all";
  search: string;
  profitability: ProfitabilityFilter;
};

export type HistorySummary = {
  optionsCount: number;
  bestOptionName: string | null;
  totalNetProfit: number;
  averageNetMargin: number;
};

export type HistorySnapshot = {
  id: string;
  name: string;
  createdAt: string;
  milePrices: MilePrices;
  options: FlightOption[];
  summary: HistorySummary;
};
