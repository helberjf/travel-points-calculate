"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type AirlineKey = "smiles" | "latam" | "azul" | "outro";
type MileValues = Record<AirlineKey, number>;
type NumberField = "miles" | "cash" | "sale";
type Tone = "slate" | "emerald" | "rose" | "sky";

type EmissionOption = {
  id: string;
  name: string;
  airline: AirlineKey;
  miles: number;
  cash: number;
  sale: number;
};

type QuickCalculator = Pick<EmissionOption, "airline" | "miles" | "cash" | "sale">;

type RankedOption = EmissionOption & {
  airlineLabel: string;
  ratePerThousand: number;
  milesCost: number;
  totalCost: number;
  profit: number;
  margin: number;
  minimumSale: number;
};

const STORAGE_KEY = "calculadora-milhas:state";
const AIRLINES: Array<{ key: AirlineKey; label: string; description: string }> = [
  { key: "smiles", label: "Smiles / Gol", description: "Custo base por 1.000 milhas." },
  { key: "latam", label: "LATAM Pass", description: "Custo base por 1.000 milhas." },
  { key: "azul", label: "Azul Fidelidade", description: "Custo base por 1.000 milhas." },
  { key: "outro", label: "Outra", description: "Programa adicional configurável." },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const milesFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const panelClassName =
  "rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur";
const inputClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";
const selectClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";
const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800";
const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
const dangerButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100";

function getDefaultMileValues(): MileValues {
  return { smiles: 16, latam: 26, azul: 18, outro: 0 };
}

function getDefaultOptions(): EmissionOption[] {
  return [
    { id: "option-1", name: "Opção 1", airline: "smiles", miles: 46000, cash: 0, sale: 800 },
    { id: "option-2", name: "Opção 2", airline: "smiles", miles: 8280, cash: 690, sale: 800 },
    { id: "option-3", name: "Opção 3", airline: "latam", miles: 24183, cash: 50, sale: 800 },
  ];
}

function getDefaultQuickCalculator(): QuickCalculator {
  return { airline: "smiles", miles: 25000, cash: 120, sale: 850 };
}

function createOptionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `option-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createOption(position: number): EmissionOption {
  return { id: createOptionId(), name: `Opção ${position}`, airline: "smiles", miles: 0, cash: 0, sale: 0 };
}

function joinClasses(...classNames: string[]): string {
  return classNames.filter(Boolean).join(" ");
}

function isAirlineKey(value: unknown): value is AirlineKey {
  return AIRLINES.some((airline) => airline.key === value);
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatMiles(value: number): string {
  return milesFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

function toneFromValue(value: number): Tone {
  if (value > 0) return "emerald";
  if (value < 0) return "rose";
  return "slate";
}

function labelForAirline(airline: AirlineKey): string {
  return AIRLINES.find((item) => item.key === airline)?.label ?? "Outra";
}

function calculate(entry: QuickCalculator, mileValues: MileValues) {
  const ratePerThousand = mileValues[entry.airline];
  const milesCost = (entry.miles / 1000) * ratePerThousand;
  const totalCost = milesCost + entry.cash;
  const profit = entry.sale - totalCost;
  const margin = entry.sale > 0 ? (profit / entry.sale) * 100 : 0;

  return {
    airlineLabel: labelForAirline(entry.airline),
    ratePerThousand,
    milesCost,
    totalCost,
    profit,
    margin,
    minimumSale: totalCost,
  };
}

function loadState(): {
  mileValues?: MileValues;
  options?: EmissionOption[];
  quickCalculator?: QuickCalculator;
} | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const mileValues =
      parsed.mileValues && typeof parsed.mileValues === "object"
        ? {
            smiles: toNumber((parsed.mileValues as Record<string, unknown>).smiles, 16),
            latam: toNumber((parsed.mileValues as Record<string, unknown>).latam, 26),
            azul: toNumber((parsed.mileValues as Record<string, unknown>).azul, 18),
            outro: toNumber((parsed.mileValues as Record<string, unknown>).outro, 0),
          }
        : undefined;

    const options = Array.isArray(parsed.options)
      ? parsed.options.flatMap((item, index) => {
          if (!item || typeof item !== "object") return [];
          const option = item as Partial<Record<keyof EmissionOption, unknown>>;

          return [
            {
              id: typeof option.id === "string" && option.id.trim() ? option.id : createOptionId(),
              name: typeof option.name === "string" && option.name.trim() ? option.name : `Opção ${index + 1}`,
              airline: isAirlineKey(option.airline) ? option.airline : "smiles",
              miles: toNumber(option.miles, 0),
              cash: toNumber(option.cash, 0),
              sale: toNumber(option.sale, 0),
            },
          ];
        })
      : undefined;

    const quickCalculator =
      parsed.quickCalculator && typeof parsed.quickCalculator === "object"
        ? {
            airline: isAirlineKey((parsed.quickCalculator as Record<string, unknown>).airline)
              ? ((parsed.quickCalculator as Record<string, unknown>).airline as AirlineKey)
              : "smiles",
            miles: toNumber((parsed.quickCalculator as Record<string, unknown>).miles, 0),
            cash: toNumber((parsed.quickCalculator as Record<string, unknown>).cash, 0),
            sale: toNumber((parsed.quickCalculator as Record<string, unknown>).sale, 0),
          }
        : undefined;

    return { mileValues, options, quickCalculator };
  } catch {
    return null;
  }
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function MetricCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: Tone }) {
  const palette =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "sky"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={joinClasses("rounded-2xl border p-4", palette)}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export default function Home() {
  const [mileValues, setMileValues] = useState<MileValues>(getDefaultMileValues);
  const [options, setOptions] = useState<EmissionOption[]>(getDefaultOptions);
  const [quickCalculator, setQuickCalculator] = useState<QuickCalculator>(getDefaultQuickCalculator);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const state = loadState();
    const timer = window.setTimeout(() => {
      if (state?.mileValues) setMileValues(state.mileValues);
      if (state?.options) setOptions(state.options);
      if (state?.quickCalculator) setQuickCalculator(state.quickCalculator);
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mileValues, options, quickCalculator }));
  }, [hasLoadedStorage, mileValues, options, quickCalculator]);

  const rankedOptions = useMemo<RankedOption[]>(() => {
    return options
      .map((option) => ({ ...option, ...calculate(option, mileValues) }))
      .sort((left, right) => right.profit - left.profit || right.margin - left.margin || left.totalCost - right.totalCost);
  }, [mileValues, options]);

  const bestOption = rankedOptions[0] ?? null;
  const quickResult = useMemo(() => calculate(quickCalculator, mileValues), [mileValues, quickCalculator]);

  const summary = useMemo(() => {
    const totalProfit = rankedOptions.reduce((sum, option) => sum + option.profit, 0);
    const bestMargin = rankedOptions.length ? Math.max(...rankedOptions.map((option) => option.margin)) : 0;
    const averageProfit = rankedOptions.length > 0 ? totalProfit / rankedOptions.length : 0;
    return { totalProfit, bestMargin, averageProfit };
  }, [rankedOptions]);

  function updateOption(id: string, patch: Partial<EmissionOption>) {
    setOptions((current) => current.map((option) => (option.id === id ? { ...option, ...patch } : option)));
  }

  function updateOptionNumber(id: string, field: NumberField, value: string) {
    updateOption(id, { [field]: toNumber(value, 0) } as Partial<EmissionOption>);
  }

  function addOption() {
    setOptions((current) => [...current, createOption(current.length + 1)]);
  }

  function removeOption(id: string) {
    setOptions((current) => current.filter((option) => option.id !== id));
  }

  function restoreDefaults() {
    setMileValues(getDefaultMileValues());
    setOptions(getDefaultOptions());
    setQuickCalculator(getDefaultQuickCalculator());
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="min-h-screen font-sans text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className={joinClasses(panelClassName, "relative overflow-hidden")}>
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_35%)]" />
          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Calculadora premium
                </span>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Compare emissões e venda melhor suas passagens com milhas.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Ajuste o valor do milheiro, acompanhe custo real, lucro, margem e venda mínima e mantenha tudo salvo automaticamente no navegador.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <button type="button" className={primaryButtonClassName} onClick={addOption}>Adicionar opção</button>
                <button type="button" className={secondaryButtonClassName} onClick={restoreDefaults}>Restaurar padrão</button>
                <button type="button" className={dangerButtonClassName} onClick={() => setOptions([])}>Limpar todas as opções</button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Melhor lucro" value={formatCurrency(bestOption?.profit ?? 0)} tone={toneFromValue(bestOption?.profit ?? 0)} />
              <MetricCard label="Lucro total" value={formatCurrency(summary.totalProfit)} tone={toneFromValue(summary.totalProfit)} />
              <MetricCard label="Melhor margem" value={formatPercent(summary.bestMargin)} tone={summary.bestMargin > 0 ? "sky" : "slate"} />
              <MetricCard label="Lucro médio" value={formatCurrency(summary.averageProfit)} tone={toneFromValue(summary.averageProfit)} />
            </div>
          </div>
        </section>

        <section className={joinClasses(panelClassName, "mt-6")}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">Valor do milheiro</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Base de custo por companhia aérea</h2>
            </div>
            <p className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {hasLoadedStorage ? "Salvamento automático ativo no navegador." : "Carregando dados salvos..."}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AIRLINES.map((airline) => (
              <div key={airline.key} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">{airline.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{airline.description}</p>
                <div className="relative mt-4">
                  <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-sm font-semibold text-slate-500">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={joinClasses(inputClassName, "pl-10")}
                    value={mileValues[airline.key]}
                    onChange={(event) =>
                      setMileValues((current) => ({ ...current, [airline.key]: toNumber(event.target.value, 0) }))
                    }
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Valor por 1.000 milhas.</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
          <div className="space-y-6">
            <section className={panelClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Ranking das emissões
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Comparador principal
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    As emissões são ordenadas automaticamente pela maior lucratividade.
                  </p>
                </div>
                <button type="button" className={primaryButtonClassName} onClick={addOption}>
                  Nova opção
                </button>
              </div>

              {rankedOptions.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Nenhuma opção cadastrada no comparador.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Adicione uma emissão para montar seu ranking de lucratividade.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {rankedOptions.map((option, index) => (
                    <article
                      key={option.id}
                      className={joinClasses(
                        "rounded-3xl border p-5 shadow-sm",
                        index === 0
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {index === 0 ? "Melhor opção" : "Posição no ranking"}
                            </p>
                            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                              {option.name.trim() || `Opção ${index + 1}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <span
                            className={joinClasses(
                              "inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold",
                              option.profit >= 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700",
                            )}
                          >
                            {option.profit >= 0 ? "Lucro" : "Prejuízo"}{" "}
                            {formatCurrency(option.profit)}
                          </span>
                          <button
                            type="button"
                            className={dangerButtonClassName}
                            onClick={() => removeOption(option.id)}
                          >
                            Remover opção
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Field label="Nome da opção">
                          <input
                            type="text"
                            className={inputClassName}
                            value={option.name}
                            onChange={(event) =>
                              updateOption(option.id, { name: event.target.value })
                            }
                          />
                        </Field>

                        <Field label="Companhia aérea">
                          <select
                            className={selectClassName}
                            value={option.airline}
                            onChange={(event) =>
                              updateOption(option.id, {
                                airline: event.target.value as AirlineKey,
                              })
                            }
                          >
                            {AIRLINES.map((airline) => (
                              <option key={airline.key} value={airline.key}>
                                {airline.label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Quantidade de milhas" hint="milhas">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className={inputClassName}
                            value={option.miles}
                            onChange={(event) =>
                              updateOptionNumber(option.id, "miles", event.target.value)
                            }
                          />
                        </Field>

                        <Field label="Taxa / complemento" hint="R$">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={inputClassName}
                            value={option.cash}
                            onChange={(event) =>
                              updateOptionNumber(option.id, "cash", event.target.value)
                            }
                          />
                        </Field>

                        <Field label="Venda para o cliente" hint="R$">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={inputClassName}
                            value={option.sale}
                            onChange={(event) =>
                              updateOptionNumber(option.id, "sale", event.target.value)
                            }
                          />
                        </Field>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <MetricCard
                          label="Custo das milhas"
                          value={formatCurrency(option.milesCost)}
                        />
                        <MetricCard
                          label="Custo total"
                          value={formatCurrency(option.totalCost)}
                        />
                        <MetricCard
                          label="Lucro"
                          value={formatCurrency(option.profit)}
                          tone={toneFromValue(option.profit)}
                        />
                        <MetricCard
                          label="Margem"
                          value={formatPercent(option.margin)}
                          tone={toneFromValue(option.margin)}
                        />
                        <MetricCard
                          label="Venda mínima"
                          value={formatCurrency(option.minimumSale)}
                          tone="sky"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <section className={panelClassName}>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Fórmulas
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Como os cálculos são feitos
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="Custo das milhas"
                  value="(milhas / 1000) x valor do milheiro"
                  tone="sky"
                />
                <MetricCard
                  label="Custo total"
                  value="custo das milhas + taxa"
                />
                <MetricCard
                  label="Lucro"
                  value="venda - custo total"
                  tone="emerald"
                />
                <MetricCard
                  label="Margem"
                  value="(lucro / venda) x 100"
                  tone="sky"
                />
                <MetricCard
                  label="Venda mínima"
                  value="igual ao custo total"
                  tone="rose"
                />
              </div>
            </section>
          </div>
          <aside className="space-y-6">
            <section
              className={joinClasses(panelClassName, "border-emerald-200 bg-emerald-50/40")}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Melhor opção
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Destaque do comparador
              </h2>

              {bestOption ? (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-white/90 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-slate-950">
                        {bestOption.name.trim() || "Opção sem nome"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {bestOption.airlineLabel} • {formatMiles(bestOption.miles)} milhas
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                      {formatCurrency(bestOption.profit)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      label="Venda final"
                      value={formatCurrency(bestOption.sale)}
                      tone="sky"
                    />
                    <MetricCard
                      label="Custo total"
                      value={formatCurrency(bestOption.totalCost)}
                    />
                    <MetricCard
                      label="Margem"
                      value={formatPercent(bestOption.margin)}
                      tone={toneFromValue(bestOption.margin)}
                    />
                    <MetricCard
                      label="Venda mínima"
                      value={formatCurrency(bestOption.minimumSale)}
                      tone="emerald"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-emerald-300 bg-white/80 p-6 text-sm leading-6 text-slate-600">
                  Adicione uma emissão para ver aqui a opção mais lucrativa.
                </div>
              )}
            </section>
            <section className={panelClassName}>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Calculadora rápida
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Teste uma emissão separada
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Esse card não entra no ranking principal.
              </p>

              <div className="mt-5 grid gap-4">
                <Field label="Companhia aérea">
                  <select
                    className={selectClassName}
                    value={quickCalculator.airline}
                    onChange={(event) =>
                      setQuickCalculator((current) => ({
                        ...current,
                        airline: event.target.value as AirlineKey,
                      }))
                    }
                  >
                    {AIRLINES.map((airline) => (
                      <option key={airline.key} value={airline.key}>
                        {airline.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Quantidade de milhas" hint="milhas">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClassName}
                    value={quickCalculator.miles}
                    onChange={(event) =>
                      setQuickCalculator((current) => ({
                        ...current,
                        miles: toNumber(event.target.value, 0),
                      }))
                    }
                  />
                </Field>

                <Field label="Taxa / complemento" hint="R$">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    value={quickCalculator.cash}
                    onChange={(event) =>
                      setQuickCalculator((current) => ({
                        ...current,
                        cash: toNumber(event.target.value, 0),
                      }))
                    }
                  />
                </Field>

                <Field label="Venda para o cliente" hint="R$">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    value={quickCalculator.sale}
                    onChange={(event) =>
                      setQuickCalculator((current) => ({
                        ...current,
                        sale: toNumber(event.target.value, 0),
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Custo das milhas"
                  value={formatCurrency(quickResult.milesCost)}
                />
                <MetricCard
                  label="Custo total"
                  value={formatCurrency(quickResult.totalCost)}
                />
                <MetricCard
                  label="Lucro"
                  value={formatCurrency(quickResult.profit)}
                  tone={toneFromValue(quickResult.profit)}
                />
                <MetricCard
                  label="Margem"
                  value={formatPercent(quickResult.margin)}
                  tone={toneFromValue(quickResult.margin)}
                />
                <MetricCard
                  label="Venda mínima"
                  value={formatCurrency(quickResult.minimumSale)}
                  tone="sky"
                />
                <MetricCard
                  label="Milheiro usado"
                  value={formatCurrency(quickResult.ratePerThousand)}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
