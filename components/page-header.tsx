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
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
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
  themeMode,
  onToggleTheme,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-900/90 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_35%)]" />
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:border-sky-700/70 dark:bg-sky-950/70 dark:text-sky-200">
                Ferramenta operacional
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex h-8 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {themeMode === "dark" ? "Modo claro" : "Modo escuro"}
              </button>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
              Calculadora de lucro para emissao com milhas
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Compare varias emissoes, calcule lucro bruto e liquido, acompanhe
              comissao, filtros, historico local e exportacao CSV em uma unica
              tela pronta para operacao.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5 dark:border-slate-700 dark:bg-slate-800/90 lg:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Melhor cenario atual
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              {bestOptionName ?? "Sem opcoes filtradas"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Lucro liquido em destaque:{" "}
              <span className="font-semibold text-slate-950 dark:text-slate-100">
                {formatBRL(bestOptionNetProfit)}
              </span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isFiltered
                ? `Resumo baseado em ${visibleCount} de ${totalCount} opcoes apos filtro.`
                : `Resumo baseado nas ${totalCount} opcoes atuais.`}
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
