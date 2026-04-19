"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2 font-semibold tracking-[-0.05em] text-white ${
        compact ? "text-lg sm:text-2xl" : "text-4xl sm:text-6xl"
      }`}
    >
      <span>Crypto</span>
      <span className="welcome-bitcoin-logo inline-flex items-center justify-center">
        <span
          className={
            compact
              ? "text-[1.35rem] leading-none sm:text-[2rem]"
              : "text-[2.4rem] leading-none sm:text-[3.4rem]"
          }
        >
          ₿
        </span>
      </span>
      <span>Trade</span>
    </span>
  );
}

export default function SupportPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
      <Link
        href="/?screen=dashboard"
        className="fixed left-3 top-3 z-30 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,26,0.72),rgba(10,20,38,0.4))] px-3 py-2.5 shadow-[0_18px_40px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-[linear-gradient(180deg,rgba(8,17,32,0.82),rgba(12,25,46,0.5))] sm:left-6 sm:top-6 sm:px-4 sm:py-3"
      >
        <BrandLogo compact />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1520px] flex-col pt-18 sm:min-h-[calc(100vh-3rem)] sm:pt-24">
        <div className="mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => router.push("/?screen=dashboard")}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-white/10"
          >
            ← Назад
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <section className="w-full max-w-3xl rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,24,0.76),rgba(11,20,38,0.48))] px-4 py-6 text-center shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur-xl sm:rounded-[2rem] sm:px-10 sm:py-10">
            <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-200 sm:text-xs sm:tracking-[0.3em]">
              Поддержка
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white sm:mt-6 sm:text-5xl">
              Чем мы можем помочь?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">
              Опишите вашу проблему или вопрос, и мы постараемся помочь.
            </p>

            <div className="mt-6 flex justify-center sm:mt-8">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-sky-300/18 bg-sky-400/14 px-5 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(56,189,248,0.14)] transition hover:bg-sky-400/18 sm:w-auto sm:max-w-none sm:px-6 sm:text-base"
              >
                <span aria-hidden="true" className="text-base leading-none">
                  🎧
                </span>
                <span>Написать в Telegram</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
