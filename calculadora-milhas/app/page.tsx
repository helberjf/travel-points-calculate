"use client";

import { ActionBar } from "@/components/action-bar";
import { FilterBar } from "@/components/filter-bar";
import { FormulaSection } from "@/components/formula-section";
import { HistorySection } from "@/components/history-section";
import { MilheiroForm } from "@/components/milheiro-form";
import { OptionsList } from "@/components/options-list";
import { PageHeader } from "@/components/page-header";
import { QuickCalculator } from "@/components/quick-calculator";
import { RankingList } from "@/components/ranking-list";
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

function toNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export default function Home() {
  const [milePrices, setMilePrices] = useState<MilePrices>(getDefaultMilePrices);
  const [options, setOptions] = useState<FlightOption[]>(getDefaultOptions);
  const [quickCalculator, setQuickCalculator] = useState<QuickCalculatorState>(
    getDefaultQuickCalculator,
  );
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

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
    setOptions((current) => [...current, createEmptyOption(current.length + 1)]);
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
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PageHeader
            bestOptionName={activeSummary.bestOption?.name ?? null}
            bestOptionNetProfit={activeSummary.bestOption?.netProfit ?? 0}
            optionsCount={activeSummary.optionsCount}
            averageNetMargin={activeSummary.averageNetMargin}
            totalNetProfit={activeSummary.totalNetProfit}
            isFiltered={isFiltered}
            visibleCount={filteredOptions.length}
            totalCount={calculatedOptions.length}
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

          <OptionsList
            options={filteredOptions}
            onTextChange={handleOptionTextChange}
            onCompanyChange={handleOptionCompanyChange}
            onNumberChange={handleOptionNumberChange}
            onCommissionTypeChange={handleOptionCommissionTypeChange}
            onRemove={(id) =>
              setOptions((current) => current.filter((option) => option.id !== id))
            }
          />

          <RankingList options={filteredOptions} />

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
        </div>
      </div>
    </main>
  );
}
