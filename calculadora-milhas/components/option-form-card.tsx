import { COMMISSION_TYPE_OPTIONS, COMPANY_OPTIONS } from "@/lib/constants";
import { formatBRL, formatPercent } from "@/lib/formatters";
import type {
  CalculatedFlightOption,
  CommissionType,
  CompanyKey,
} from "@/types";
import type { ReactNode } from "react";

type OptionFormCardProps = {
  option: CalculatedFlightOption;
  position: number;
  onTextChange: (id: string, field: "name", value: string) => void;
  onCompanyChange: (id: string, company: CompanyKey) => void;
  onNumberChange: (
    id: string,
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) => void;
  onCommissionTypeChange: (id: string, value: CommissionType) => void;
  onRemove: (id: string) => void;
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

function Metric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "rose" | "sky";
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

export function OptionFormCard({
  option,
  position,
  onTextChange,
  onCompanyChange,
  onNumberChange,
  onCommissionTypeChange,
  onRemove,
}: OptionFormCardProps) {
  return (
    <article
      className={`rounded-[32px] border p-5 shadow-sm ${
        position === 0
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            {position + 1}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {position === 0 ? "Melhor opção do ranking" : "Cenário comparado"}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              {option.name.trim() || `Opção ${position + 1}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold ${
              option.netProfit >= 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {option.netProfit >= 0 ? "Lucro líquido" : "Prejuízo líquido"}{" "}
            {formatBRL(option.netProfit)}
          </span>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            onClick={() => onRemove(option.id)}
          >
            Remover opção
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Nome da opção">
          <input
            type="text"
            value={option.name}
            onChange={(event) => onTextChange(option.id, "name", event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Companhia aérea">
          <select
            value={option.company}
            onChange={(event) =>
              onCompanyChange(option.id, event.target.value as CompanyKey)
            }
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
            value={option.miles}
            onChange={(event) =>
              onNumberChange(option.id, "miles", event.target.value)
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Taxa / complemento" hint="R$">
          <input
            type="number"
            min="0"
            step="0.01"
            value={option.cashAmount}
            onChange={(event) =>
              onNumberChange(option.id, "cashAmount", event.target.value)
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Venda para o cliente" hint="R$">
          <input
            type="number"
            min="0"
            step="0.01"
            value={option.saleAmount}
            onChange={(event) =>
              onNumberChange(option.id, "saleAmount", event.target.value)
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <Field label="Tipo de comissão">
          <select
            value={option.commissionType}
            onChange={(event) =>
              onCommissionTypeChange(
                option.id,
                event.target.value as CommissionType,
              )
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
          hint={option.commissionType === "fixed" ? "R$" : "%"}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={option.commissionValue}
            onChange={(event) =>
              onNumberChange(option.id, "commissionValue", event.target.value)
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </Field>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Comissão aplicada
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {option.commissionType === "fixed"
              ? "Valor fixo em reais"
              : "Percentual sobre a venda"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {option.commissionType === "fixed"
              ? formatBRL(option.commissionValue)
              : formatPercent(option.commissionValue)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <Metric label="Custo das milhas" value={formatBRL(option.milesCost)} />
        <Metric label="Custo total" value={formatBRL(option.totalCost)} />
        <Metric
          label="Lucro bruto"
          value={formatBRL(option.grossProfit)}
          tone={getTone(option.grossProfit)}
        />
        <Metric
          label="Comissão em reais"
          value={formatBRL(option.commissionAmount)}
          tone="sky"
        />
        <Metric
          label="Lucro líquido"
          value={formatBRL(option.netProfit)}
          tone={getTone(option.netProfit)}
        />
        <Metric
          label="Margem bruta"
          value={formatPercent(option.grossMargin)}
          tone={getTone(option.grossMargin)}
        />
        <Metric
          label="Margem líquida"
          value={formatPercent(option.netMargin)}
          tone={getTone(option.netMargin)}
        />
        <Metric
          label="Venda mínima"
          value={formatBRL(option.breakevenSale)}
          tone="sky"
        />
      </div>
    </article>
  );
}
