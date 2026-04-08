import { COMPANY_OPTIONS } from "@/lib/constants";
import type { MilePrices } from "@/types";

type MilheiroFormProps = {
  milePrices: MilePrices;
  onChange: (companyKey: keyof MilePrices, value: string) => void;
};

export function MilheiroForm({ milePrices, onChange }: MilheiroFormProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Valor do milheiro
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Base de custo por companhia aérea
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Ajuste o valor de cada programa para recalcular automaticamente custo
          das milhas, custo total e lucratividade em toda a tela.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COMPANY_OPTIONS.map((company) => (
          <div
            key={company.key}
            className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
          >
            <p className="text-sm font-semibold text-slate-900">{company.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {company.description}
            </p>
            <div className="relative mt-4">
              <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-sm font-semibold text-slate-500">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={milePrices[company.key]}
                onChange={(event) => onChange(company.key, event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Valor por 1.000 milhas.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
