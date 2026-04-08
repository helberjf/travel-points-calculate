import { COMPANY_OPTIONS, PROFITABILITY_OPTIONS } from "@/lib/constants";
import type { FilterState } from "@/types";

type FilterBarProps = {
  filters: FilterState;
  visibleCount: number;
  totalCount: number;
  onChange: (patch: Partial<FilterState>) => void;
};

export function FilterBar({
  filters,
  visibleCount,
  totalCount,
  onChange,
}: FilterBarProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Filtros
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Refine a leitura do comparador
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Mostrando {visibleCount} de {totalCount} opções no ranking atual.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Companhia aérea
          </span>
          <select
            value={filters.company}
            onChange={(event) =>
              onChange({ company: event.target.value as FilterState["company"] })
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          >
            <option value="all">Todas as companhias</option>
            {COMPANY_OPTIONS.map((company) => (
              <option key={company.key} value={company.key}>
                {company.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Buscar por nome
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Ex.: ida executiva, promoção, cenário 1"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Status financeiro
          </span>
          <select
            value={filters.profitability}
            onChange={(event) =>
              onChange({
                profitability: event.target.value as FilterState["profitability"],
              })
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          >
            {PROFITABILITY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
