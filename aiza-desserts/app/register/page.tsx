"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

const USER_PROFILE_STORAGE_KEY = "crypto-trade-user-profile";

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

export default function RegisterPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window === "undefined") {
      return { firstName: "", lastName: "", email: "" };
    }

    try {
      const stored = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (!stored) {
        return { firstName: "", lastName: "", email: "" };
      }

      const parsed = JSON.parse(stored) as Partial<UserProfile>;
      return {
        firstName: parsed.firstName ?? "",
        lastName: parsed.lastName ?? "",
        email: parsed.email ?? "",
      };
    } catch {
      return { firstName: "", lastName: "", email: "" };
    }
  });
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof UserProfile, value: string) => {
    const nextProfile = { ...profile, [field]: value };
    setProfile(nextProfile);
    setSaved(false);

    try {
      window.localStorage.setItem(
        USER_PROFILE_STORAGE_KEY,
        JSON.stringify(nextProfile),
      );
    } catch {
      // Keep the form usable even if storage is unavailable.
    }
  };

  const saveProfile = () => {
    try {
      window.localStorage.setItem(
        USER_PROFILE_STORAGE_KEY,
        JSON.stringify(profile),
      );
    } catch {
      // Keep current values in state if storage is unavailable.
    }

    setSaved(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
      <Link
        href="/dashboard"
        className="fixed left-3 top-3 z-30 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,26,0.72),rgba(10,20,38,0.4))] px-3 py-2.5 shadow-[0_18px_40px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-[linear-gradient(180deg,rgba(8,17,32,0.82),rgba(12,25,46,0.5))] sm:left-6 sm:top-6 sm:px-4 sm:py-3"
      >
        <BrandLogo compact />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1520px] flex-col pt-18 sm:min-h-[calc(100vh-3rem)] sm:pt-24">
        <div className="mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }

              router.push("/dashboard");
            }}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-white/10"
          >
            ← Назад
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <section className="w-full max-w-2xl rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,24,0.76),rgba(11,20,38,0.48))] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
            <div className="mb-5 text-center sm:mb-6">
              <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-200 sm:text-xs sm:tracking-[0.3em]">
                Профиль
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:mt-5 sm:text-4xl">
                Регистрация
              </h1>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Имя
                </span>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="w-full rounded-[1rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/20 focus:bg-white/10"
                  placeholder="Введите имя"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Фамилия
                </span>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="w-full rounded-[1rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/20 focus:bg-white/10"
                  placeholder="Введите фамилию"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Email
                </span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-[1rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/20 focus:bg-white/10"
                  placeholder="Введите email"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={saveProfile}
                className="w-full rounded-full border border-sky-300/18 bg-sky-400/14 px-5 py-3 text-sm font-medium text-white shadow-[0_0_28px_rgba(56,189,248,0.12)] transition hover:bg-sky-400/18 sm:w-auto"
              >
                Сохранить
              </button>
              <span className="text-sm text-emerald-200">
                {saved ? "Данные сохранены" : ""}
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
