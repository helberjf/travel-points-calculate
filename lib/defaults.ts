import type {
  FilterState,
  FlightOption,
  HistorySnapshot,
  MilePrices,
  QuickCalculatorState,
} from "@/types";

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function getDefaultMilePrices(): MilePrices {
  return {
    smiles: 16,
    latam: 26,
    azul: 18,
    outro: 0,
  };
}

export function getDefaultOptions(): FlightOption[] {
  return [
    {
      id: "option-1",
      name: "Opção 1",
      company: "smiles",
      miles: 46000,
      cashAmount: 0,
      saleAmount: 800,
      commissionType: "fixed",
      commissionValue: 0,
    },
    {
      id: "option-2",
      name: "Opção 2",
      company: "smiles",
      miles: 8280,
      cashAmount: 690,
      saleAmount: 800,
      commissionType: "fixed",
      commissionValue: 0,
    },
    {
      id: "option-3",
      name: "Opção 3",
      company: "latam",
      miles: 24183,
      cashAmount: 50,
      saleAmount: 800,
      commissionType: "fixed",
      commissionValue: 0,
    },
  ];
}

export function getDefaultQuickCalculator(): QuickCalculatorState {
  return {
    company: "latam",
    miles: 0,
    cashAmount: 0,
    saleAmount: 0,
    commissionType: "fixed",
    commissionValue: 0,
  };
}

export function getDefaultFilters(): FilterState {
  return {
    company: "all",
    search: "",
    profitability: "all",
  };
}

export function getDefaultHistory(): HistorySnapshot[] {
  return [];
}

export function createEmptyOption(position: number): FlightOption {
  return {
    id: createId("option"),
    name: `Opção ${position}`,
    company: "smiles",
    miles: 0,
    cashAmount: 0,
    saleAmount: 0,
    commissionType: "fixed",
    commissionValue: 0,
  };
}

export function createHistoryName(position: number): string {
  return `Snapshot ${position}`;
}
