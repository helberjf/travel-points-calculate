import { COMMISSION_TYPE_OPTIONS, COMPANY_OPTIONS } from "@/lib/constants";
import { formatBRL, formatPercent } from "@/lib/formatters";
import type {
  CalculatedFlightOption,
  CommissionType,
  CompanyKey,
} from "@/types";

type DirectCompareProps = {
  options: CalculatedFlightOption[];
  onAddOption: () => void;
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

export function DirectCompare({
  options,
  onAddOption,
  onTextChange,
  onCompanyChange,
  onNumberChange,
  onCommissionTypeChange,
  onRemove,
}: DirectCompareProps) {
  const bestOption = options[0] ?? null;

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              Comparacao direta
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Adicione os planos e veja o melhor lucro
            </h2>
          </div>
          <button
            type="button"
            onClick={onAddOption}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Novo plano
          </button>
        </div>

        {bestOption ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-700/50 dark:bg-emerald-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Melhor opcao agora
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {bestOption.name} ({bestOption.companyLabel})
              </p>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Lucro liquido: {formatBRL(bestOption.netProfit)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {options.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Nenhum plano adicionado ainda.
          </div>
        ) : (
          options.map((option, index) => (
            <article
              key={option.id}
              className={`rounded-2xl border p-3 ${
                index === 0
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-700/50 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/70"
              }`}
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Nome do plano
                  </span>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(event) => onTextChange(option.id, "name", event.target.value)}
                    placeholder="Ex: Opcao 3"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Companhia aerea
                  </span>
                  <select
                    value={option.company}
                    onChange={(event) =>
                      onCompanyChange(option.id, event.target.value as CompanyKey)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {COMPANY_OPTIONS.map((company) => (
                      <option key={company.key} value={company.key}>
                        {company.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Quantidade de pontos para a viagem
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={option.miles === 0 ? "" : option.miles}
                    onChange={(event) =>
                      onNumberChange(option.id, "miles", event.target.value)
                    }
                    placeholder="Ex: 24183"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Taxa / complemento em dinheiro (R$)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.cashAmount === 0 ? "" : option.cashAmount}
                    onChange={(event) =>
                      onNumberChange(option.id, "cashAmount", event.target.value)
                    }
                    placeholder="Ex: 50"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Valor de venda ao cliente (R$)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.saleAmount === 0 ? "" : option.saleAmount}
                    onChange={(event) =>
                      onNumberChange(option.id, "saleAmount", event.target.value)
                    }
                    placeholder="Ex: 800"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Tipo de comissao
                  </span>
                  <select
                    value={option.commissionType}
                    onChange={(event) =>
                      onCommissionTypeChange(option.id, event.target.value as CommissionType)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {COMMISSION_TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Valor da comissao
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.commissionValue === 0 ? "" : option.commissionValue}
                    onChange={(event) =>
                      onNumberChange(option.id, "commissionValue", event.target.value)
                    }
                    placeholder="Ex: 5 ou 50"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => onRemove(option.id)}
                    className="h-10 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-white px-3 py-2 text-xs dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">Custo total</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatBRL(option.totalCost)}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-xs dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">Lucro bruto</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatBRL(option.grossProfit)}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-xs dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">Lucro liquido</p>
                  <p
                    className={`font-semibold ${
                      option.netProfit >= 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {formatBRL(option.netProfit)}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-xs dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">Margem liquida</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPercent(option.netMargin)}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
