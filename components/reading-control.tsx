"use client";

import { createId } from "@/lib/defaults";
import { formatDateTime } from "@/lib/formatters";
import { useEffect, useMemo, useState } from "react";

type ReadingStatus = "andamento" | "concluido";

type ReadingBook = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  pagesRead: number;
  status: ReadingStatus;
  createdAt: string;
};

type ReadingGoals = {
  booksGoal: number;
  pagesGoal: number;
};

const STORAGE_BOOKS_KEY = "calculadora-milhas:reading-books";
const STORAGE_GOALS_KEY = "calculadora-milhas:reading-goals";

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsed));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readBooks(): ReadingBook[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_BOOKS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ReadingBook[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (book) =>
        typeof book.id === "string" &&
        typeof book.title === "string" &&
        typeof book.author === "string" &&
        typeof book.totalPages === "number" &&
        typeof book.pagesRead === "number" &&
        (book.status === "andamento" || book.status === "concluido"),
    );
  } catch {
    return [];
  }
}

function readGoals(): ReadingGoals {
  if (typeof window === "undefined") {
    return { booksGoal: 12, pagesGoal: 3000 };
  }

  const raw = window.localStorage.getItem(STORAGE_GOALS_KEY);
  if (!raw) {
    return { booksGoal: 12, pagesGoal: 3000 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReadingGoals>;
    return {
      booksGoal: toNumber(String(parsed.booksGoal ?? 12), 12) || 12,
      pagesGoal: toNumber(String(parsed.pagesGoal ?? 3000), 3000) || 3000,
    };
  } catch {
    return { booksGoal: 12, pagesGoal: 3000 };
  }
}

export function ReadingControl() {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [goals, setGoals] = useState<ReadingGoals>({ booksGoal: 12, pagesGoal: 3000 });
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("andamento");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooks(readBooks());
      setGoals(readGoals());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books));
  }, [books, loaded]);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
  }, [goals, loaded]);

  const summary = useMemo(() => {
    const inProgress = books.filter((book) => book.status === "andamento").length;
    const completed = books.filter((book) => book.status === "concluido").length;
    const pagesReadTotal = books.reduce((sum, book) => sum + book.pagesRead, 0);
    const pagesTotal = books.reduce((sum, book) => sum + book.totalPages, 0);

    const booksProgress = goals.booksGoal > 0 ? (completed / goals.booksGoal) * 100 : 0;
    const pagesProgress = goals.pagesGoal > 0 ? (pagesReadTotal / goals.pagesGoal) * 100 : 0;

    return {
      inProgress,
      completed,
      pagesReadTotal,
      pagesTotal,
      booksProgress: clamp(booksProgress, 0, 100),
      pagesProgress: clamp(pagesProgress, 0, 100),
    };
  }, [books, goals.booksGoal, goals.pagesGoal]);

  function addBook() {
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const total = toNumber(totalPages, 0);
    const read = clamp(toNumber(pagesRead, 0), 0, total > 0 ? total : Number.MAX_SAFE_INTEGER);

    if (!cleanTitle || !cleanAuthor || total <= 0) {
      return;
    }

    const nextStatus: ReadingStatus = status === "concluido" || read >= total ? "concluido" : "andamento";

    setBooks((current) => [
      {
        id: createId("book"),
        title: cleanTitle,
        author: cleanAuthor,
        totalPages: total,
        pagesRead: read,
        status: nextStatus,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setTitle("");
    setAuthor("");
    setTotalPages("");
    setPagesRead("");
    setStatus("andamento");
  }

  function updateBook(id: string, patch: Partial<ReadingBook>) {
    setBooks((current) =>
      current.map((book) => {
        if (book.id !== id) {
          return book;
        }

        const merged = { ...book, ...patch };
        const normalizedRead = clamp(merged.pagesRead, 0, merged.totalPages);
        const normalizedStatus: ReadingStatus =
          merged.status === "concluido" || normalizedRead >= merged.totalPages
            ? "concluido"
            : "andamento";

        return {
          ...merged,
          pagesRead: normalizedRead,
          status: normalizedStatus,
        };
      }),
    );
  }

  function removeBook(id: string) {
    setBooks((current) => current.filter((book) => book.id !== id));
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Leitura
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Controle de leitura com metas e progresso
          </h2>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Meta de livros
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={goals.booksGoal}
            onChange={(event) =>
              setGoals((current) => ({
                ...current,
                booksGoal: toNumber(event.target.value, current.booksGoal) || current.booksGoal,
              }))
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Meta de paginas
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={goals.pagesGoal}
            onChange={(event) =>
              setGoals((current) => ({
                ...current,
                pagesGoal: toNumber(event.target.value, current.pagesGoal) || current.pagesGoal,
              }))
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
          Grafico de progresso
        </p>

        <div className="mt-2 space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Livros concluidos</span>
              <span>
                {summary.completed}/{goals.booksGoal} ({summary.booksProgress.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-3 rounded-full bg-emerald-500"
                style={{ width: `${summary.booksProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Paginas lidas</span>
              <span>
                {summary.pagesReadTotal}/{goals.pagesGoal} ({summary.pagesProgress.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-3 rounded-full bg-sky-500"
                style={{ width: `${summary.pagesProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Em andamento: <span className="font-semibold">{summary.inProgress}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Concluidos: <span className="font-semibold">{summary.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
          Registrar livro
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titulo"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Autor"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            min="1"
            step="1"
            value={totalPages}
            onChange={(event) => setTotalPages(event.target.value)}
            placeholder="Paginas totais"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={pagesRead}
            onChange={(event) => setPagesRead(event.target.value)}
            placeholder="Paginas lidas"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ReadingStatus)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="andamento">Em andamento</option>
            <option value="concluido">Concluido</option>
          </select>
        </div>
        <button
          type="button"
          onClick={addBook}
          className="mt-2 h-10 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Adicionar livro
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {books.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Nenhum livro registrado ainda.
          </div>
        ) : (
          books.map((book) => (
            <article
              key={book.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                <input
                  type="text"
                  value={book.title}
                  onChange={(event) => updateBook(book.id, { title: event.target.value })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  value={book.author}
                  onChange={(event) => updateBook(book.id, { author: event.target.value })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={book.totalPages}
                  onChange={(event) =>
                    updateBook(book.id, {
                      totalPages: toNumber(event.target.value, book.totalPages),
                    })
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={book.pagesRead}
                  onChange={(event) =>
                    updateBook(book.id, {
                      pagesRead: toNumber(event.target.value, book.pagesRead),
                    })
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <select
                  value={book.status}
                  onChange={(event) =>
                    updateBook(book.id, { status: event.target.value as ReadingStatus })
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="andamento">Em andamento</option>
                  <option value="concluido">Concluido</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeBook(book.id)}
                  className="h-10 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  Remover
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Registrado em {formatDateTime(book.createdAt)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
