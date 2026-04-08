type ActionBarProps = {
  snapshotName: string;
  onSnapshotNameChange: (value: string) => void;
  onAddOption: () => void;
  onClearOptions: () => void;
  onRestoreDefaults: () => void;
  onSaveHistory: () => void;
  onExportOptions: () => void;
  onExportHistory: () => void;
  canSaveHistory: boolean;
  canExportOptions: boolean;
  canExportHistory: boolean;
};

const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300";
const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100";

export function ActionBar({
  snapshotName,
  onSnapshotNameChange,
  onAddOption,
  onClearOptions,
  onRestoreDefaults,
  onSaveHistory,
  onExportOptions,
  onExportHistory,
  canSaveHistory,
  canExportOptions,
  canExportHistory,
}: ActionBarProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Ações
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Operações rápidas do cenário
        </h2>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Nome para salvar no histórico
          </span>
          <input
            type="text"
            value={snapshotName}
            onChange={(event) => onSnapshotNameChange(event.target.value)}
            placeholder="Ex.: Ida executiva julho, Promoção fim de semana"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button type="button" className={primaryButtonClassName} onClick={onAddOption}>
            Adicionar opção
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onSaveHistory}
            disabled={!canSaveHistory}
          >
            Salvar no histórico
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onExportOptions}
            disabled={!canExportOptions}
          >
            Exportar opções CSV
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onExportHistory}
            disabled={!canExportHistory}
          >
            Exportar histórico CSV
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={onRestoreDefaults}
          >
            Restaurar padrão
          </button>
          <button
            type="button"
            className={dangerButtonClassName}
            onClick={onClearOptions}
          >
            Limpar todas as opções
          </button>
        </div>
      </div>
    </section>
  );
}
