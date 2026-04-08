"use client";

import { createId } from "@/lib/defaults";
import { formatDateTime } from "@/lib/formatters";
import { useEffect, useMemo, useRef, useState } from "react";

type AgendaEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  notes: string;
  remindBeforeMinutes: number;
};

const STORAGE_KEY = "calculadora-milhas:agenda-events";

function toNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function readEvents(): AgendaEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as AgendaEvent[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((event) => event.id && event.title && event.startAt && event.endAt);
  } catch {
    return [];
  }
}

function writeEvents(events: AgendaEvent[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function toCalendarDate(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function getGoogleCalendarLink(event: AgendaEvent): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = `&text=${encodeURIComponent(event.title)}`;
  const dates = `&dates=${toCalendarDate(event.startAt)}/${toCalendarDate(event.endAt)}`;
  const details = `&details=${encodeURIComponent(event.notes || "Evento criado na agenda pessoal.")}`;
  return `${base}${text}${dates}${details}`;
}

function buildIcsContent(events: AgendaEvent[]): string {
  const body = events
    .map((event) => {
      return [
        "BEGIN:VEVENT",
        `UID:${event.id}`,
        `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
        `DTSTART:${toCalendarDate(event.startAt)}`,
        `DTEND:${toCalendarDate(event.endAt)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${(event.notes || "").replace(/\n/g, "\\n")}`,
        "END:VEVENT",
      ].join("\n");
    })
    .join("\n");

  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Calculadora Milhas//Agenda//PT-BR", body, "END:VCALENDAR"].join("\n");
}

function downloadIcs(filename: string, events: AgendaEvent[]): void {
  if (typeof window === "undefined" || events.length === 0) {
    return;
  }

  const content = buildIcsContent(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PersonalAgenda() {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState(30);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEvents(readEvents());
      setNotificationEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    writeEvents(events);
  }, [events, hasLoaded]);

  useEffect(() => {
    if (!notificationEnabled || typeof Notification === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      const now = Date.now();

      events.forEach((event) => {
        const eventTime = new Date(event.startAt).getTime();
        const remindAt = eventTime - event.remindBeforeMinutes * 60 * 1000;
        const key = `${event.id}:${event.startAt}`;

        if (now >= remindAt && now < eventTime && !notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          new Notification("Lembrete de compromisso", {
            body: `${event.title} às ${formatDateTime(event.startAt)}`,
          });
        }
      });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [events, notificationEnabled]);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    );
  }, [events]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationEnabled(permission === "granted");
  }

  function addEvent() {
    if (!title.trim() || !startAt || !endAt) {
      return;
    }

    const event: AgendaEvent = {
      id: createId("agenda"),
      title: title.trim(),
      startAt,
      endAt,
      notes: notes.trim(),
      remindBeforeMinutes,
    };

    setEvents((current) => [event, ...current]);
    setTitle("");
    setStartAt("");
    setEndAt("");
    setNotes("");
    setRemindBeforeMinutes(30);
  }

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Agenda pessoal
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Agenda de compromissos com calendario e lembretes
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={enableNotifications}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {notificationEnabled ? "Notificacoes ativas" : "Ativar notificacoes"}
          </button>
          <button
            type="button"
            onClick={() => downloadIcs("agenda-compromissos.ics", sortedEvents)}
            className="h-9 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Exportar agenda (.ics)
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titulo do compromisso"
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="datetime-local"
          value={startAt}
          onChange={(event) => setStartAt(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="datetime-local"
          value={endAt}
          onChange={(event) => setEndAt(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="number"
          min="1"
          step="1"
          value={remindBeforeMinutes}
          onChange={(event) => setRemindBeforeMinutes(toNumber(event.target.value))}
          placeholder="Lembrar antes (min)"
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={2}
        placeholder="Observacoes (opcional)"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />

      <button
        type="button"
        onClick={addEvent}
        className="mt-2 h-10 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
      >
        Adicionar compromisso
      </button>

      <div className="mt-4 space-y-2">
        {sortedEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Sem compromissos ainda.
          </div>
        ) : (
          sortedEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inicio: {formatDateTime(event.startAt)} • Fim: {formatDateTime(event.endAt)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lembrete: {event.remindBeforeMinutes} min antes
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={getGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Google Calendar
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcs(`evento-${event.id}.ics`, [event])}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Calendario local
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    className="h-8 rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    Remover
                  </button>
                </div>
              </div>
              {event.notes ? (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {event.notes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
