import { COMMISSION_TYPE_OPTIONS, COMPANY_OPTIONS } from "@/lib/constants";
import { formatBRL, formatPercent } from "@/lib/formatters";
import type {
  CalculatedFlightOption,
  CommissionType,
  CompanyKey,
  QuickCalculatorState,
} from "@/types";
import type { ReactNode } from "react";

type QuickCalculatorProps = {
  value: QuickCalculatorState;
  result: CalculatedFlightOption;
  onCompanyChange: (value: CompanyKey) => void;
  onNumberChange: (
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) => void;
  onCommissionTypeChange: (value: CommissionType) => void;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function ResultCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "slate" | "emerald" | "rose" | "sky";
}) {
  const palette =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "sky"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl border p-4 ${palette}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-2 text-base font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function getTone(value: number): "slate" | "emerald" | "rose" {
  if (value > 0) return "emerald";
  if (value < 0) return "rose";
  return "slate";
}

export function QuickCalculator({
  value,
  result,
  onCompanyChange,
  onNumberChange,
  onCommissionTypeChange,
}: QuickCalculatorProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Calculadora rápida
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Teste um cenário sem adicionar ao comparador
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Companhia aérea">
          <select
            value={value.company}
            onChange={(event) => onCompanyChange(event.target.value as CompanyKey)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          >
            {COMPANY_OPTIONS.map((company) => (
              <option key={company.key} value={company.key}>
                {company.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Quantidade de milhas" hint="milhas">
          <input
            type="number"
            min="0"
            step="1"
            value={value.miles}
            onChange={(event) => onNumberChange("miles", event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Taxa / complemento" hint="R$">
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.cashAmount}
            onChange={(event) => onNumberChange("cashAmount", event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Venda para o cliente" hint="R$">
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.saleAmount}
            onChange={(event) => onNumberChange("saleAmount", event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Tipo de comissão">
          <select
            value={value.commissionType}
            onChange={(event) =>
              onCommissionTypeChange(event.target.value as CommissionType)
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          >
            {COMMISSION_TYPE_OPTIONS.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Valor da comissão"
          hint={value.commissionType === "fixed" ? "R$" : "%"}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.commissionValue}
            onChange={(event) => onNumberChange("commissionValue", event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ResultCard label="Custo das milhas" value={formatBRL(result.milesCost)} tone="slate" />
        <ResultCard label="Custo total" value={formatBRL(result.totalCost)} tone="slate" />
        <ResultCard
          label="Lucro bruto"
          value={formatBRL(result.grossProfit)}
          tone={getTone(result.grossProfit)}
        />
        <ResultCard
          label="Comissão em reais"
          value={formatBRL(result.commissionAmount)}
          tone="sky"
        />
        <ResultCard
          label="Lucro líquido"
          value={formatBRL(result.netProfit)}
          tone={getTone(result.netProfit)}
        />
        <ResultCard
          label="Margem bruta"
          value={formatPercent(result.grossMargin)}
          tone={getTone(result.grossMargin)}
        />
        <ResultCard
          label="Margem líquida"
          value={formatPercent(result.netMargin)}
          tone={getTone(result.netMargin)}
        />
        <ResultCard
          label="Venda mínima"
          value={formatBRL(result.breakevenSale)}
          tone="sky"
        />
      </div>
    </section>
  );
}
