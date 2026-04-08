"use client";

import { createId } from "@/lib/defaults";
import { useEffect, useMemo, useRef, useState } from "react";

type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm
  notes: string;
  active: boolean;
  createdAt: string;
};

const STORAGE_KEY = "calculadora-milhas:medications";

function readMedications(): MedicationItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MedicationItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.dosage === "string" &&
        typeof item.time === "string" &&
        typeof item.notes === "string" &&
        typeof item.active === "boolean",
    );
  } catch {
    return [];
  }
}

function writeMedications(items: MedicationItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function nowDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentTimeHHmm(): string {
  const date = new Date();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function MedicationsAgenda() {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<MedicationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readMedications());
      setNotificationsEnabled(
        typeof Notification !== "undefined" && Notification.permission === "granted",
      );
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    writeMedications(items);
  }, [items, loaded]);

  useEffect(() => {
    if (!notificationsEnabled || typeof Notification === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      const today = nowDateKey();
      const nowTime = currentTimeHHmm();

      items.forEach((item) => {
        if (!item.active || !item.time) {
          return;
        }

        const key = `${item.id}:${today}:${item.time}`;
        if (item.time === nowTime && !notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          new Notification("Lembrete de medicamento", {
            body: `${item.name} (${item.dosage}) agora às ${item.time}.`,
          });
        }
      });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [items, notificationsEnabled]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.time.localeCompare(b.time));
  }, [items]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  }

  function addMedication() {
    const cleanName = name.trim();
    const cleanDosage = dosage.trim();
    const cleanTime = time.trim();

    if (!cleanName || !cleanDosage || !cleanTime) {
      return;
    }

    setItems((current) => [
      {
        id: createId("med"),
        name: cleanName,
        dosage: cleanDosage,
        time: cleanTime,
        notes: notes.trim(),
        active: true,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setName("");
    setDosage("");
    setTime("");
    setNotes("");
  }

  function updateItem(id: string, patch: Partial<MedicationItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Saude
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Agenda de medicamentos com lembrete desktop
          </h2>
        </div>
        <button
          type="button"
          onClick={enableNotifications}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {notificationsEnabled ? "Lembretes ativos" : "Ativar lembrete desktop"}
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
          Cadastrar remedio e horario
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do remedio"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            value={dosage}
            onChange={(event) => setDosage(event.target.value)}
            placeholder="Dose (ex: 1 comprimido)"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Observacoes (opcional)"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={addMedication}
            className="h-10 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {sortedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Nenhum remedio cadastrado ainda.
          </div>
        ) : (
          sortedItems.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                <input
                  type="text"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  value={item.dosage}
                  onChange={(event) => updateItem(item.id, { dosage: event.target.value })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="time"
                  value={item.time}
                  onChange={(event) => updateItem(item.id, { time: event.target.value })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  value={item.notes}
                  onChange={(event) => updateItem(item.id, { notes: event.target.value })}
                  placeholder="Observacoes"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => updateItem(item.id, { active: !item.active })}
                  className={`h-10 rounded-xl border px-3 text-sm font-semibold transition ${
                    item.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  {item.active ? "Ativo" : "Pausado"}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="h-10 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  Remover
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
