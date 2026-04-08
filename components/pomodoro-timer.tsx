"use client";

import { createId } from "@/lib/defaults";
import { formatDateTime } from "@/lib/formatters";
import { useEffect, useMemo, useState } from "react";

type Phase = "focus" | "shortBreak" | "longBreak";

type PomodoroConfig = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
};

type ProductivityEntry = {
  id: string;
  completedAt: string;
  focusMinutes: number;
  cycleNumber: number;
};

const HISTORY_STORAGE_KEY = "calculadora-milhas:pomodoro-history";
const CONFIG_STORAGE_KEY = "calculadora-milhas:pomodoro-config";

const DEFAULT_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
};

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.floor(parsed));
}

function readConfig(): PomodoroConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG;
  }

  const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PomodoroConfig>;
    return {
      focusMinutes: toNumber(String(parsed.focusMinutes ?? DEFAULT_CONFIG.focusMinutes), DEFAULT_CONFIG.focusMinutes),
      shortBreakMinutes: toNumber(
        String(parsed.shortBreakMinutes ?? DEFAULT_CONFIG.shortBreakMinutes),
        DEFAULT_CONFIG.shortBreakMinutes,
      ),
      longBreakMinutes: toNumber(
        String(parsed.longBreakMinutes ?? DEFAULT_CONFIG.longBreakMinutes),
        DEFAULT_CONFIG.longBreakMinutes,
      ),
      cyclesUntilLongBreak: toNumber(
        String(parsed.cyclesUntilLongBreak ?? DEFAULT_CONFIG.cyclesUntilLongBreak),
        DEFAULT_CONFIG.cyclesUntilLongBreak,
      ),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function readHistory(): ProductivityEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ProductivityEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry) => entry.id && entry.completedAt);
  } catch {
    return [];
  }
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function phaseLabel(phase: Phase): string {
  if (phase === "focus") {
    return "Foco";
  }

  if (phase === "shortBreak") {
    return "Pausa curta";
  }

  return "Pausa longa";
}

export function PomodoroTimer() {
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_CONFIG.focusMinutes * 60);
  const [history, setHistory] = useState<ProductivityEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedConfig = readConfig();
      const storedHistory = readHistory();
      setConfig(storedConfig);
      setHistory(storedHistory);
      setPhase("focus");
      setSecondsLeft(storedConfig.focusMinutes * 60);
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config, loaded]);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history, loaded]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) {
          return current - 1;
        }

        if (phase === "focus") {
          const nextCycle = cycleCount + 1;
          const usedLongBreak = nextCycle % config.cyclesUntilLongBreak === 0;

          setHistory((historyCurrent) => [
            {
              id: createId("pomodoro"),
              completedAt: new Date().toISOString(),
              focusMinutes: config.focusMinutes,
              cycleNumber: nextCycle,
            },
            ...historyCurrent,
          ]);
          setCycleCount(nextCycle);
          setPhase(usedLongBreak ? "longBreak" : "shortBreak");
          return (usedLongBreak ? config.longBreakMinutes : config.shortBreakMinutes) * 60;
        }

        setPhase("focus");
        return config.focusMinutes * 60;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [config, cycleCount, phase, running]);

  const totalFocusMinutes = useMemo(
    () => history.reduce((sum, entry) => sum + entry.focusMinutes, 0),
    [history],
  );

  function handleConfigChange(field: keyof PomodoroConfig, value: string) {
    setConfig((current) => ({
      ...current,
      [field]: toNumber(value, current[field]),
    }));
  }

  function applyConfigNow() {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(config.focusMinutes * 60);
  }

  function resetTimer() {
    setRunning(false);
    setCycleCount(0);
    setPhase("focus");
    setSecondsLeft(config.focusMinutes * 60);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Pomodoro online
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Timer customizavel com historico de produtividade
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-slate-600 dark:text-slate-300">
            Fase atual: <span className="font-semibold">{phaseLabel(phase)}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Ciclo: <span className="font-semibold">{cycleCount}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Foco (min)
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={config.focusMinutes}
            onChange={(event) => handleConfigChange("focusMinutes", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pausa curta (min)
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={config.shortBreakMinutes}
            onChange={(event) => handleConfigChange("shortBreakMinutes", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pausa longa (min)
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={config.longBreakMinutes}
            onChange={(event) => handleConfigChange("longBreakMinutes", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ciclos ate pausa longa
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={config.cyclesUntilLongBreak}
            onChange={(event) => handleConfigChange("cyclesUntilLongBreak", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="h-10 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Resetar
        </button>
        <button
          type="button"
          onClick={applyConfigNow}
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Aplicar configuracao
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Tempo restante
        </p>
        <p className="mt-2 font-mono text-5xl font-semibold text-slate-900 dark:text-slate-100">
          {formatClock(secondsLeft)}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Historico de produtividade
          </p>
          <button
            type="button"
            onClick={clearHistory}
            className="h-8 rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            Limpar historico
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Sessoes concluidas: {history.length} • Minutos focados: {totalFocusMinutes}
        </p>
        <div className="mt-2 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhuma sessao concluida ainda.
            </p>
          ) : (
            history.slice(0, 12).map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Ciclo {entry.cycleNumber} concluido
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {entry.focusMinutes} min de foco • {formatDateTime(entry.completedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
