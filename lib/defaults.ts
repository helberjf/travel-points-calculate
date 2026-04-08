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
  return [];
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

export function createEmptyOption(): FlightOption {
  return {
    id: createId("option"),
    name: "",
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
