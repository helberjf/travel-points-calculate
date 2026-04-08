import type {
  CalculatedFlightOption,
  FilterState,
} from "@/types";

export function filterOptions(
  options: CalculatedFlightOption[],
  filters: FilterState,
): CalculatedFlightOption[] {
  const search = filters.search.trim().toLowerCase();

  return options.filter((option) => {
    const matchesCompany =
      filters.company === "all" || option.company === filters.company;
    const matchesSearch =
      search.length === 0 || option.name.toLowerCase().includes(search);
    const matchesProfitability =
      filters.profitability === "all" ||
      (filters.profitability === "profitable" && option.netProfit >= 0) ||
      (filters.profitability === "loss" && option.netProfit < 0);

    return matchesCompany && matchesSearch && matchesProfitability;
  });
}

export function getFilteredSummary(options: CalculatedFlightOption[]) {
  const optionsCount = options.length;
  const totalNetProfit = options.reduce((sum, option) => sum + option.netProfit, 0);
  const totalGrossProfit = options.reduce((sum, option) => sum + option.grossProfit, 0);
  const averageNetMargin =
    optionsCount > 0
      ? options.reduce((sum, option) => sum + option.netMargin, 0) / optionsCount
      : 0;
  const averageGrossMargin =
    optionsCount > 0
      ? options.reduce((sum, option) => sum + option.grossMargin, 0) / optionsCount
      : 0;
  const profitableCount = options.filter((option) => option.netProfit >= 0).length;
  const lossCount = optionsCount - profitableCount;
  const bestOption = options[0] ?? null;

  return {
    optionsCount,
    totalNetProfit,
    totalGrossProfit,
    averageNetMargin,
    averageGrossMargin,
    profitableCount,
    lossCount,
    bestOption,
  };
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.company !== "all" ||
    filters.search.trim().length > 0 ||
    filters.profitability !== "all"
  );
}
