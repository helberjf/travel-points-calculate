import { EmptyState } from "@/components/empty-state";
import { formatBRL, formatMiles, formatPercent } from "@/lib/formatters";
import type { CalculatedFlightOption } from "@/types";

type RankingListProps = {
  options: CalculatedFlightOption[];
};

export function RankingList({ options }: RankingListProps) {
  const bestOption = options[0] ?? null;

  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Ranking
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Ordem por lucro líquido
        </h2>
      </div>

      {bestOption ? (
        <div className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Melhor opção atual
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-950">
                {bestOption.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {bestOption.companyLabel} • {formatMiles(bestOption.miles)} milhas
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-600">Lucro líquido</p>
              <p className="text-2xl font-semibold text-emerald-700">
                {formatBRL(bestOption.netProfit)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        {options.length === 0 ? (
          <EmptyState
            title="Ranking vazio"
            description="Quando houver opções visíveis, o ranking ordenado por lucro líquido aparecerá aqui."
          />
        ) : (
          <ol className="space-y-3">
            {options.map((option, index) => (
              <li
                key={`${option.id}-ranking`}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-tight text-slate-950">
                        {option.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {option.companyLabel} • {formatMiles(option.miles)} milhas
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Margem líquida {formatPercent(option.netMargin)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      option.netProfit >= 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {formatBRL(option.netProfit)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
