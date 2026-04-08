import { COMPANY_OPTIONS } from "@/lib/constants";
import type {
  CalculatedFlightOption,
  CommissionType,
  CompanyKey,
  HistorySummary,
  FlightOption,
  MilePrices,
} from "@/types";

export function calculateMilesCost(miles: number, milePrice: number): number {
  return (miles / 1000) * milePrice;
}

export function calculateTotalCost(milesCost: number, cashAmount: number): number {
  return milesCost + cashAmount;
}

export function calculateGrossProfit(saleAmount: number, totalCost: number): number {
  return saleAmount - totalCost;
}

export function calculateCommissionValue(
  saleAmount: number,
  commissionType: CommissionType,
  commissionValue: number,
): number {
  if (commissionType === "percent") {
    return (saleAmount * commissionValue) / 100;
  }

  return commissionValue;
}

export function calculateNetProfit(
  grossProfit: number,
  commissionAmount: number,
): number {
  return grossProfit - commissionAmount;
}

export function calculateGrossMargin(
  saleAmount: number,
  grossProfit: number,
): number {
  return saleAmount > 0 ? (grossProfit / saleAmount) * 100 : 0;
}

export function calculateNetMargin(saleAmount: number, netProfit: number): number {
  return saleAmount > 0 ? (netProfit / saleAmount) * 100 : 0;
}

export function calculateBreakevenSale(totalCost: number): number {
  return totalCost;
}

export function getCompanyLabel(company: CompanyKey): string {
  return COMPANY_OPTIONS.find((item) => item.key === company)?.label ?? "Outra";
}

export function calculateOption(
  option: FlightOption,
  milePrices: MilePrices,
): CalculatedFlightOption {
  const milePrice = milePrices[option.company];
  const milesCost = calculateMilesCost(option.miles, milePrice);
  const totalCost = calculateTotalCost(milesCost, option.cashAmount);
  const grossProfit = calculateGrossProfit(option.saleAmount, totalCost);
  const commissionAmount = calculateCommissionValue(
    option.saleAmount,
    option.commissionType,
    option.commissionValue,
  );
  const netProfit = calculateNetProfit(grossProfit, commissionAmount);
  const grossMargin = calculateGrossMargin(option.saleAmount, grossProfit);
  const netMargin = calculateNetMargin(option.saleAmount, netProfit);
  const breakevenSale = calculateBreakevenSale(totalCost);

  return {
    ...option,
    companyLabel: getCompanyLabel(option.company),
    milePrice,
    milesCost,
    totalCost,
    grossProfit,
    commissionAmount,
    netProfit,
    grossMargin,
    netMargin,
    breakevenSale,
  };
}

export function sortOptionsByNetProfit(
  options: CalculatedFlightOption[],
): CalculatedFlightOption[] {
  return [...options].sort(
    (left, right) =>
      right.netProfit - left.netProfit ||
      right.netMargin - left.netMargin ||
      left.totalCost - right.totalCost,
  );
}

export function buildHistorySummary(
  options: CalculatedFlightOption[],
): HistorySummary {
  const totalNetProfit = options.reduce((sum, option) => sum + option.netProfit, 0);
  const averageNetMargin =
    options.length > 0
      ? options.reduce((sum, option) => sum + option.netMargin, 0) / options.length
      : 0;
  const bestOptionName = sortOptionsByNetProfit(options)[0]?.name ?? null;

  return {
    optionsCount: options.length,
    bestOptionName,
    totalNetProfit,
    averageNetMargin,
  };
}
