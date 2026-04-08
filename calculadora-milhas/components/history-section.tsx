import { EmptyState } from "@/components/empty-state";
import { formatBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import type { HistorySnapshot } from "@/types";

type HistorySectionProps = {
  history: HistorySnapshot[];
  onRestore: (snapshotId: string) => void;
  onRemove: (snapshotId: string) => void;
};

export function HistorySection({
  history,
  onRestore,
  onRemove,
}: HistorySectionProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Histórico local
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Snapshots salvos no navegador
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {history.length} {history.length === 1 ? "snapshot salvo" : "snapshots salvos"}
        </p>
      </div>

      <div className="mt-6">
        {history.length === 0 ? (
          <EmptyState
            title="Nenhum snapshot salvo"
            description="Use o botão “Salvar no histórico” para guardar o estado atual das opções, valores dos milheiros e resumo financeiro."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {history.map((snapshot) => (
              <article
                key={snapshot.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-950">
                      {snapshot.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateTime(snapshot.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700">
                    {snapshot.summary.optionsCount} opções
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Melhor opção
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {snapshot.summary.bestOptionName ?? "Sem opções"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Lucro líquido total
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatBRL(snapshot.summary.totalNetProfit)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Margem líquida média
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatPercent(snapshot.summary.averageNetMargin)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Valores do milheiro
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Smiles {formatBRL(snapshot.milePrices.smiles)} • LATAM{" "}
                      {formatBRL(snapshot.milePrices.latam)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Azul {formatBRL(snapshot.milePrices.azul)} • Outra{" "}
                      {formatBRL(snapshot.milePrices.outro)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onRestore(snapshot.id)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Restaurar snapshot
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(snapshot.id)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remover snapshot
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
