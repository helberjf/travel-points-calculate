const formulaCards = [
  {
    title: "Custo das milhas",
    value: "(milhas / 1000) x valor do milheiro",
    tone: "sky",
  },
  {
    title: "Custo total",
    value: "custo das milhas + taxa",
    tone: "slate",
  },
  {
    title: "Lucro bruto",
    value: "venda - custo total",
    tone: "emerald",
  },
  {
    title: "Comissão em reais",
    value: "fixa ou percentual sobre a venda",
    tone: "sky",
  },
  {
    title: "Lucro líquido",
    value: "lucro bruto - comissão",
    tone: "emerald",
  },
  {
    title: "Margem bruta",
    value: "(lucro bruto / venda) x 100",
    tone: "slate",
  },
  {
    title: "Margem líquida",
    value: "(lucro líquido / venda) x 100",
    tone: "sky",
  },
  {
    title: "Venda mínima",
    value: "igual ao custo total",
    tone: "rose",
  },
];

function getToneClass(tone: string): string {
  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "rose") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (tone === "sky") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function FormulaSection() {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Fórmulas
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Regras usadas pela calculadora
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Todos os resultados seguem as regras de negócio aplicadas ao mercado de
          venda de passagens emitidas com milhas.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {formulaCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-4 ${getToneClass(card.tone)}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {card.title}
            </p>
            <p className="mt-2 text-base font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
