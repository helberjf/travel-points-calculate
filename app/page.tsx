"use client";

import { ActionBar } from "@/components/action-bar";
import { DirectCompare } from "@/components/direct-compare";
import { FilterBar } from "@/components/filter-bar";
import { FormulaSection } from "@/components/formula-section";
import { FuelConsumption } from "@/components/fuel-consumption";
import { HistorySection } from "@/components/history-section";
import { MedicationsAgenda } from "@/components/medications-agenda";
import { MilheiroForm } from "@/components/milheiro-form";
import { PageHeader } from "@/components/page-header";
import { PersonalAgenda } from "@/components/personal-agenda";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { QuickCalculator } from "@/components/quick-calculator";
import { ReadingControl } from "@/components/reading-control";
import { QuoteGenerator } from "@/components/quote-generator";
import { buildHistorySummary, calculateOption, sortOptionsByNetProfit } from "@/lib/calculations";
import { exportHistoryToCSV, exportOptionsToCSV } from "@/lib/csv";
import {
  createEmptyOption,
  createHistoryName,
  createId,
  getDefaultFilters,
  getDefaultMilePrices,
  getDefaultOptions,
  getDefaultQuickCalculator,
} from "@/lib/defaults";
import { filterOptions, getFilteredSummary, hasActiveFilters } from "@/lib/filters";
import {
  clearAllStoredData,
  getStoredFilters,
  getStoredHistory,
  getStoredMilePrices,
  getStoredOptions,
  getStoredQuickCalculator,
  saveFilters,
  saveHistory,
  saveMilePrices,
  saveOptions,
  saveQuickCalculator,
} from "@/lib/storage";
import type {
  CommissionType,
  CompanyKey,
  FilterState,
  FlightOption,
  HistorySnapshot,
  MilePrices,
  QuickCalculatorState,
} from "@/types";
import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";
const THEME_STORAGE_KEY = "calculadora-milhas:theme";

function toNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export default function Home() {
  const defaultOptions = useMemo(() => getDefaultOptions(), []);
  const [milePrices, setMilePrices] = useState<MilePrices>(getDefaultMilePrices);
  const [options, setOptions] = useState<FlightOption[]>(defaultOptions);
  const [quickCalculator, setQuickCalculator] = useState<QuickCalculatorState>(
    getDefaultQuickCalculator,
  );
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMilePrices(getStoredMilePrices());
      setOptions(getStoredOptions());
      setQuickCalculator(getStoredQuickCalculator());
      setFilters(getStoredFilters());
      setHistory(getStoredHistory());
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    saveMilePrices(milePrices);
    saveOptions(options);
    saveQuickCalculator(quickCalculator);
    saveFilters(filters);
    saveHistory(history);
  }, [filters, hasLoadedStorage, history, milePrices, options, quickCalculator]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    const timer = window.setTimeout(() => {
      setThemeMode(nextTheme);
      setHasLoadedTheme(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedTheme || typeof document === "undefined") {
      return;
    }

    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [hasLoadedTheme, themeMode]);

  const calculatedOptions = useMemo(() => {
    return sortOptionsByNetProfit(
      options.map((option) => calculateOption(option, milePrices)),
    );
  }, [milePrices, options]);

  const filteredOptions = useMemo(() => {
    return filterOptions(calculatedOptions, filters);
  }, [calculatedOptions, filters]);

  const allSummary = useMemo(() => {
    return getFilteredSummary(calculatedOptions);
  }, [calculatedOptions]);

  const filteredSummary = useMemo(() => {
    return getFilteredSummary(filteredOptions);
  }, [filteredOptions]);

  const isFiltered = useMemo(() => hasActiveFilters(filters), [filters]);

  const activeSummary = isFiltered ? filteredSummary : allSummary;

  const quickCalculatorResult = useMemo(() => {
    return calculateOption(
      {
        id: "quick-calculator",
        name: "Calculadora rápida",
        company: quickCalculator.company,
        miles: quickCalculator.miles,
        cashAmount: quickCalculator.cashAmount,
        saleAmount: quickCalculator.saleAmount,
        commissionType: quickCalculator.commissionType,
        commissionValue: quickCalculator.commissionValue,
      },
      milePrices,
    );
  }, [milePrices, quickCalculator]);

  function updateOption(id: string, patch: Partial<FlightOption>) {
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, ...patch } : option)),
    );
  }

  function handleOptionTextChange(
    id: string,
    field: "name",
    value: string,
  ) {
    updateOption(id, { [field]: value } as Partial<FlightOption>);
  }

  function handleOptionCompanyChange(id: string, company: CompanyKey) {
    updateOption(id, { company });
  }

  function handleOptionNumberChange(
    id: string,
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) {
    updateOption(id, { [field]: toNumber(value) } as Partial<FlightOption>);
  }

  function handleOptionCommissionTypeChange(id: string, value: CommissionType) {
    updateOption(id, { commissionType: value });
  }

  function handleAddOption() {
    setOptions((current) => [...current, createEmptyOption()]);
  }

  function handleCreateOption(option: Omit<FlightOption, "id">) {
    const cleanName = option.name.trim();
    setOptions((current) => [
      {
        ...option,
        id: createId("option"),
        name: cleanName.length > 0 ? cleanName : `Plano ${current.length + 1}`,
      },
      ...current,
    ]);
  }

  function handleClearOptions() {
    setOptions([]);
  }

  function handleRestoreDefaults() {
    setMilePrices(getDefaultMilePrices());
    setOptions(getDefaultOptions());
    setQuickCalculator(getDefaultQuickCalculator());
    setFilters(getDefaultFilters());
    setHistory([]);
    setSnapshotName("");
    clearAllStoredData();
  }

  function handleSaveHistory() {
    if (options.length === 0) {
      return;
    }

    const snapshot: HistorySnapshot = {
      id: createId("history"),
      name: snapshotName.trim() || createHistoryName(history.length + 1),
      createdAt: new Date().toISOString(),
      milePrices,
      options,
      summary: buildHistorySummary(calculatedOptions),
    };

    setHistory((current) => [snapshot, ...current]);
    setSnapshotName("");
  }

  function handleRestoreSnapshot(snapshotId: string) {
    const snapshot = history.find((item) => item.id === snapshotId);

    if (!snapshot) {
      return;
    }

    setMilePrices(snapshot.milePrices);
    setOptions(snapshot.options);
    setFilters(getDefaultFilters());
  }

  function handleRemoveSnapshot(snapshotId: string) {
    setHistory((current) => current.filter((snapshot) => snapshot.id !== snapshotId));
  }

  function handleQuickCalculatorNumberChange(
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) {
    setQuickCalculator((current) => ({
      ...current,
      [field]: toNumber(value),
    }));
  }

  return (
    <main className="min-h-screen text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <DirectCompare
            options={filteredOptions}
            milePrices={milePrices}
            onMilePriceChange={(company, value) =>
              setMilePrices((current) => ({
                ...current,
                [company]: toNumber(value),
              }))
            }
            onAddOption={handleAddOption}
            onCreateOption={handleCreateOption}
            onTextChange={handleOptionTextChange}
            onCompanyChange={handleOptionCompanyChange}
            onNumberChange={handleOptionNumberChange}
            onCommissionTypeChange={handleOptionCommissionTypeChange}
            onRemove={(id) =>
              setOptions((current) => current.filter((option) => option.id !== id))
            }
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6">
              <PageHeader
                bestOptionName={activeSummary.bestOption?.name ?? null}
                bestOptionNetProfit={activeSummary.bestOption?.netProfit ?? 0}
                optionsCount={activeSummary.optionsCount}
                averageNetMargin={activeSummary.averageNetMargin}
                totalNetProfit={activeSummary.totalNetProfit}
                isFiltered={isFiltered}
                visibleCount={filteredOptions.length}
                totalCount={calculatedOptions.length}
                themeMode={themeMode}
                onToggleTheme={() =>
                  setThemeMode((current) => (current === "light" ? "dark" : "light"))
                }
              />

              <MilheiroForm
                milePrices={milePrices}
                onChange={(companyKey, value) =>
                  setMilePrices((current) => ({
                    ...current,
                    [companyKey]: toNumber(value),
                  }))
                }
              />

              <FilterBar
                filters={filters}
                visibleCount={filteredOptions.length}
                totalCount={calculatedOptions.length}
                onChange={(patch) =>
                  setFilters((current) => ({
                    ...current,
                    ...patch,
                  }))
                }
              />

              <ActionBar
                snapshotName={snapshotName}
                onSnapshotNameChange={setSnapshotName}
                onAddOption={handleAddOption}
                onClearOptions={handleClearOptions}
                onRestoreDefaults={handleRestoreDefaults}
                onSaveHistory={handleSaveHistory}
                onExportOptions={() => exportOptionsToCSV(filteredOptions)}
                onExportHistory={() => exportHistoryToCSV(history)}
                canSaveHistory={options.length > 0}
                canExportOptions={filteredOptions.length > 0}
                canExportHistory={history.length > 0}
              />

              <QuickCalculator
                value={quickCalculator}
                result={quickCalculatorResult}
                onCompanyChange={(value) =>
                  setQuickCalculator((current) => ({
                    ...current,
                    company: value,
                  }))
                }
                onNumberChange={handleQuickCalculatorNumberChange}
                onCommissionTypeChange={(value) =>
                  setQuickCalculator((current) => ({
                    ...current,
                    commissionType: value,
                  }))
                }
              />

              <HistorySection
                history={history}
                onRestore={handleRestoreSnapshot}
                onRemove={handleRemoveSnapshot}
              />

              <FormulaSection />
            </section>

            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Sidebar de ferramentas
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  O foco principal continua no calculo de milhas. As opcoes abaixo sao extras.
                </p>
              </div>
              <QuoteGenerator />
              <PersonalAgenda />
              <PomodoroTimer />
              <ReadingControl />
              <MedicationsAgenda />
              <FuelConsumption />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
