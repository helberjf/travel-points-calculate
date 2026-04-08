import { SummaryCards } from "@/components/summary-cards";
import { formatBRL } from "@/lib/formatters";

type PageHeaderProps = {
  bestOptionName: string | null;
  bestOptionNetProfit: number;
  optionsCount: number;
  averageNetMargin: number;
  totalNetProfit: number;
  isFiltered: boolean;
  visibleCount: number;
  totalCount: number;
};

export function PageHeader({
  bestOptionName,
  bestOptionNetProfit,
  optionsCount,
  averageNetMargin,
  totalNetProfit,
  isFiltered,
  visibleCount,
  totalCount,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_35%)]" />
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Ferramenta operacional
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Calculadora de lucro para emissão com milhas
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Compare várias emissões, calcule lucro bruto e líquido, acompanhe
              comissão, filtros, histórico local e exportação CSV em uma única
              tela pronta para operação.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5 lg:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Melhor cenário atual
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {bestOptionName ?? "Sem opções filtradas"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Lucro líquido em destaque:{" "}
              <span className="font-semibold text-slate-950">
                {formatBRL(bestOptionNetProfit)}
              </span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isFiltered
                ? `Resumo baseado em ${visibleCount} de ${totalCount} opções após filtro.`
                : `Resumo baseado nas ${totalCount} opções atuais.`}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <SummaryCards
            bestOptionName={bestOptionName}
            bestOptionNetProfit={bestOptionNetProfit}
            optionsCount={optionsCount}
            averageNetMargin={averageNetMargin}
            totalNetProfit={totalNetProfit}
          />
        </div>
      </div>
    </section>
  );
}
