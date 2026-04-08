import { STORAGE_KEYS } from "@/lib/constants";
import {
  createId,
  getDefaultFilters,
  getDefaultHistory,
  getDefaultMilePrices,
  getDefaultOptions,
  getDefaultQuickCalculator,
} from "@/lib/defaults";
import type {
  FilterState,
  FlightOption,
  HistorySnapshot,
  MilePrices,
  QuickCalculatorState,
} from "@/types";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function readItem<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeItem<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function toSafeNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));

  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeMilePrices(value: unknown): MilePrices {
  const fallback = getDefaultMilePrices();

  if (!isObject(value)) {
    return fallback;
  }

  return {
    smiles: toSafeNumber(value.smiles, fallback.smiles),
    latam: toSafeNumber(value.latam, fallback.latam),
    azul: toSafeNumber(value.azul, fallback.azul),
    outro: toSafeNumber(value.outro, fallback.outro),
  };
}

function sanitizeOptions(
  value: unknown,
  fallback: FlightOption[] = getDefaultOptions(),
): FlightOption[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.flatMap((item, index) => {
    if (!isObject(item)) {
      return [];
    }

    return [
      {
        id:
          typeof item.id === "string" && item.id.trim()
            ? item.id
            : createId("option"),
        name:
          typeof item.name === "string" && item.name.trim()
            ? item.name
            : `Opção ${index + 1}`,
        company:
          item.company === "smiles" ||
          item.company === "latam" ||
          item.company === "azul" ||
          item.company === "outro"
            ? item.company
            : "smiles",
        miles: toSafeNumber(item.miles, 0),
        cashAmount: toSafeNumber(item.cashAmount, 0),
        saleAmount: toSafeNumber(item.saleAmount, 0),
        commissionType:
          item.commissionType === "percent" ? "percent" : "fixed",
        commissionValue: toSafeNumber(item.commissionValue, 0),
      },
    ];
  });
}

function sanitizeQuickCalculator(value: unknown): QuickCalculatorState {
  const fallback = getDefaultQuickCalculator();

  if (!isObject(value)) {
    return fallback;
  }

  return {
    company:
      value.company === "smiles" ||
      value.company === "latam" ||
      value.company === "azul" ||
      value.company === "outro"
        ? value.company
        : fallback.company,
    miles: toSafeNumber(value.miles, fallback.miles),
    cashAmount: toSafeNumber(value.cashAmount, fallback.cashAmount),
    saleAmount: toSafeNumber(value.saleAmount, fallback.saleAmount),
    commissionType: value.commissionType === "percent" ? "percent" : "fixed",
    commissionValue: toSafeNumber(value.commissionValue, fallback.commissionValue),
  };
}

function sanitizeFilters(value: unknown): FilterState {
  const fallback = getDefaultFilters();

  if (!isObject(value)) {
    return fallback;
  }

  return {
    company:
      value.company === "all" ||
      value.company === "smiles" ||
      value.company === "latam" ||
      value.company === "azul" ||
      value.company === "outro"
        ? value.company
        : fallback.company,
    search: typeof value.search === "string" ? value.search : fallback.search,
    profitability:
      value.profitability === "profitable" ||
      value.profitability === "loss" ||
      value.profitability === "all"
        ? value.profitability
        : fallback.profitability,
  };
}

function sanitizeHistory(value: unknown): HistorySnapshot[] {
  if (!Array.isArray(value)) {
    return getDefaultHistory();
  }

  return value.flatMap((item, index) => {
    if (!isObject(item)) {
      return [];
    }

    return [
      {
        id:
          typeof item.id === "string" && item.id.trim()
            ? item.id
            : createId("history"),
        name:
          typeof item.name === "string" && item.name.trim()
            ? item.name
            : `Snapshot ${index + 1}`,
        createdAt:
          typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        milePrices: sanitizeMilePrices(item.milePrices),
        options: sanitizeOptions(item.options, []),
        summary: isObject(item.summary)
          ? {
              optionsCount: toSafeNumber(item.summary.optionsCount, 0),
              bestOptionName:
                typeof item.summary.bestOptionName === "string"
                  ? item.summary.bestOptionName
                  : null,
              totalNetProfit: toSafeNumber(item.summary.totalNetProfit, 0),
              averageNetMargin: toSafeNumber(item.summary.averageNetMargin, 0),
            }
          : {
              optionsCount: 0,
              bestOptionName: null,
              totalNetProfit: 0,
              averageNetMargin: 0,
            },
      },
    ];
  });
}

export function getStoredMilePrices(): MilePrices {
  return sanitizeMilePrices(readItem<unknown>(STORAGE_KEYS.milePrices, getDefaultMilePrices()));
}

export function getStoredOptions(): FlightOption[] {
  return sanitizeOptions(readItem<unknown>(STORAGE_KEYS.options, getDefaultOptions()));
}

export function getStoredQuickCalculator(): QuickCalculatorState {
  return sanitizeQuickCalculator(
    readItem<unknown>(STORAGE_KEYS.quickCalculator, getDefaultQuickCalculator()),
  );
}

export function getStoredFilters(): FilterState {
  return sanitizeFilters(readItem<unknown>(STORAGE_KEYS.filters, getDefaultFilters()));
}

export function getStoredHistory(): HistorySnapshot[] {
  return sanitizeHistory(readItem<unknown>(STORAGE_KEYS.history, getDefaultHistory()));
}

export function saveMilePrices(value: MilePrices): void {
  writeItem(STORAGE_KEYS.milePrices, value);
}

export function saveOptions(value: FlightOption[]): void {
  writeItem(STORAGE_KEYS.options, value);
}

export function saveQuickCalculator(value: QuickCalculatorState): void {
  writeItem(STORAGE_KEYS.quickCalculator, value);
}

export function saveFilters(value: FilterState): void {
  writeItem(STORAGE_KEYS.filters, value);
}

export function saveHistory(value: HistorySnapshot[]): void {
  writeItem(STORAGE_KEYS.history, value);
}

export function clearAllStoredData(): void {
  if (!canUseStorage()) {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}
