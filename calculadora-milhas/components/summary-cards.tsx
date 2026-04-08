import { formatBRL, formatPercent } from "@/lib/formatters";

type SummaryCardsProps = {
  bestOptionName: string | null;
  bestOptionNetProfit: number;
  optionsCount: number;
  averageNetMargin: number;
  totalNetProfit: number;
};

function getToneClass(value: number): string {
  if (value > 0) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value < 0) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function SummaryCards({
  bestOptionName,
  bestOptionNetProfit,
  optionsCount,
  averageNetMargin,
  totalNetProfit,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Melhor opção",
      value: bestOptionName ?? "Sem opções",
      helper: "Maior lucro líquido no cenário atual.",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    },
    {
      title: "Lucro líquido líder",
      value: formatBRL(bestOptionNetProfit),
      helper: "Comparador ordenado por maior lucro líquido.",
      className: getToneClass(bestOptionNetProfit),
    },
    {
      title: "Quantidade de opções",
      value: String(optionsCount),
      helper: "Total visível no ranking atual.",
      className: "border-slate-200 bg-slate-50 text-slate-700",
    },
    {
      title: "Margem líquida média",
      value: formatPercent(averageNetMargin),
      helper: "Média das margens das opções exibidas.",
      className: averageNetMargin >= 0
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-rose-200 bg-rose-50 text-rose-700",
    },
    {
      title: "Soma do lucro líquido",
      value: formatBRL(totalNetProfit),
      helper: "Consolidação do cenário filtrado.",
      className: getToneClass(totalNetProfit),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-3xl border p-4 ${card.className}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            {card.title}
          </p>
          <p className="mt-3 text-xl font-semibold tracking-tight">
            {card.value}
          </p>
          <p className="mt-2 text-sm opacity-80">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}
