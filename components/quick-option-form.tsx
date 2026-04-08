import { COMMISSION_TYPE_OPTIONS, COMPANY_OPTIONS } from "@/lib/constants";
import type { CommissionType, CompanyKey, FlightOption } from "@/types";

type DraftOption = Omit<FlightOption, "id">;

type QuickOptionFormProps = {
  value: DraftOption;
  onTextChange: (field: "name", value: string) => void;
  onCompanyChange: (value: CompanyKey) => void;
  onNumberChange: (
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) => void;
  onCommissionTypeChange: (value: CommissionType) => void;
  onSubmit: () => void;
};

export function QuickOptionForm({
  value,
  onTextChange,
  onCompanyChange,
  onNumberChange,
  onCommissionTypeChange,
  onSubmit,
}: QuickOptionFormProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
          Inicio rapido
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Nova emissao pre-preenchida
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Ajuste os campos abaixo e toque em adicionar para enviar ao comparador.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Nome da opcao
          </span>
          <input
            type="text"
            value={value.name}
            onChange={(event) => onTextChange("name", event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Companhia
          </span>
          <select
            value={value.company}
            onChange={(event) => onCompanyChange(event.target.value as CompanyKey)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {COMPANY_OPTIONS.map((company) => (
              <option key={company.key} value={company.key}>
                {company.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Milhas
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={value.miles}
            onChange={(event) => onNumberChange("miles", event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Taxa (R$)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.cashAmount}
            onChange={(event) => onNumberChange("cashAmount", event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Venda (R$)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.saleAmount}
            onChange={(event) => onNumberChange("saleAmount", event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Tipo de comissao
          </span>
          <select
            value={value.commissionType}
            onChange={(event) =>
              onCommissionTypeChange(event.target.value as CommissionType)
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {COMMISSION_TYPE_OPTIONS.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Valor da comissao
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.commissionValue}
            onChange={(event) => onNumberChange("commissionValue", event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Adicionar ao comparador
          </button>
        </div>
      </div>
    </section>
  );
}
