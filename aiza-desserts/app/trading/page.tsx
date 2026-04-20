"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TradingViewAdvancedChart } from "../components/TradingViewAdvancedChart";

type TradingCoin = {
  symbol: string;
  name: string;
  tradingViewSymbol: string;
};

const TRADING_COINS: TradingCoin[] = [
  { symbol: "BTC", name: "Bitcoin", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { symbol: "SOL", name: "Solana", tradingViewSymbol: "BINANCE:SOLUSDT" },
  { symbol: "XRP", name: "XRP", tradingViewSymbol: "BINANCE:XRPUSDT" },
  { symbol: "ARB", name: "Arbitrum", tradingViewSymbol: "BINANCE:ARBUSDT" },
  { symbol: "ATOM", name: "Cosmos", tradingViewSymbol: "BINANCE:ATOMUSDT" },
  { symbol: "TRX", name: "TRON", tradingViewSymbol: "BINANCE:TRXUSDT" },
  { symbol: "TWT", name: "Trust Wallet Token", tradingViewSymbol: "BINANCE:TWTUSDT" },
  { symbol: "ROSE", name: "Oasis", tradingViewSymbol: "BINANCE:ROSEUSDT" },
  { symbol: "POL", name: "Polygon / MATIC", tradingViewSymbol: "BINANCE:POLUSDT" },
  { symbol: "VIRTUAL", name: "Virtual Protocol", tradingViewSymbol: "BYBIT:VIRTUALUSDT" },
  { symbol: "ADA", name: "Cardano", tradingViewSymbol: "BINANCE:ADAUSDT" },
  { symbol: "ENS", name: "Ethereum Name Service", tradingViewSymbol: "BINANCE:ENSUSDT" },
  { symbol: "FIL", name: "Filecoin", tradingViewSymbol: "BINANCE:FILUSDT" },
  { symbol: "TON", name: "Toncoin", tradingViewSymbol: "BINANCE:TONUSDT" },
  { symbol: "LTC", name: "Litecoin", tradingViewSymbol: "BINANCE:LTCUSDT" },
  { symbol: "SUI", name: "Sui", tradingViewSymbol: "BINANCE:SUIUSDT" },
  { symbol: "GRASS", name: "Grass", tradingViewSymbol: "BYBIT:GRASSUSDT" },
  { symbol: "CGPT", name: "ChainGPT", tradingViewSymbol: "BYBIT:CGPTUSDT" },
  { symbol: "ZRO", name: "LayerZero", tradingViewSymbol: "BINANCE:ZROUSDT" },
  { symbol: "TIA", name: "Celestia", tradingViewSymbol: "BINANCE:TIAUSDT" },
  { symbol: "MNT", name: "Mantle", tradingViewSymbol: "BYBIT:MNTUSDT" },
  { symbol: "AVAX", name: "Avalanche", tradingViewSymbol: "BINANCE:AVAXUSDT" },
  { symbol: "APT", name: "Aptos", tradingViewSymbol: "BINANCE:APTUSDT" },
  { symbol: "LINK", name: "Chainlink", tradingViewSymbol: "BINANCE:LINKUSDT" },
  { symbol: "ENA", name: "Ethena", tradingViewSymbol: "BINANCE:ENAUSDT" },
];

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

export default function TradingPage() {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState<TradingCoin>(TRADING_COINS[0]);
  const [search, setSearch] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const filteredCoins = useMemo(() => {
    if (!search.trim()) {
      return TRADING_COINS;
    }

    const normalized = search.toLowerCase();
    return TRADING_COINS.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(normalized) ||
        coin.name.toLowerCase().includes(normalized),
    );
  }, [search]);

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
      <Link
        href="/dashboard"
        className="fixed left-3 top-3 z-30 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,26,0.72),rgba(10,20,38,0.4))] px-3 py-2.5 shadow-[0_18px_40px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-[linear-gradient(180deg,rgba(8,17,32,0.82),rgba(12,25,46,0.5))] sm:left-6 sm:top-6 sm:px-4 sm:py-3"
      >
        <BrandLogo compact />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1520px] flex-col pt-18 sm:h-[calc(100vh-3rem)] sm:pt-24">
        <div className="mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-white/10"
          >
            ← Назад
          </button>
        </div>

        <section className="flex min-h-0 flex-1 flex-col rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,24,0.76),rgba(11,20,38,0.48))] p-3 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200/75 sm:tracking-[0.3em]">
                Спотовая торговля
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {selectedCoin.symbol}/USDT
                </h1>
                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsSelectorOpen((current) => !current)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-300/18 bg-sky-400/14 px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(56,189,248,0.12)] transition hover:bg-sky-400/18 sm:w-auto"
                  >
                    <span>Выбрать монету</span>
                    <span className="text-xs">{isSelectorOpen ? "▲" : "▼"}</span>
                  </button>

                  {isSelectorOpen ? (
                    <div className="absolute left-0 top-full z-20 mt-3 w-full max-w-full rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.92),rgba(7,14,28,0.84))] p-3 shadow-[0_24px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:w-[340px] sm:p-4">
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск монеты..."
                        className="mb-3 w-full rounded-[1rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/20 focus:bg-white/10"
                      />

                      <div className="max-h-[260px] overflow-y-auto pr-1 sm:max-h-[320px]">
                        <div className="space-y-2">
                          {filteredCoins.map((coin) => (
                            <button
                              key={coin.symbol}
                              type="button"
                              onClick={() => {
                                setSelectedCoin(coin);
                                setIsSelectorOpen(false);
                                setSearch("");
                              }}
                              className={`flex w-full items-center justify-between rounded-[1rem] border px-3 py-3 text-left transition ${
                                selectedCoin.symbol === coin.symbol
                                  ? "border-sky-300/18 bg-sky-400/10"
                                  : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  {coin.symbol}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {coin.name}
                                </p>
                              </div>
                              <span className="ml-3 shrink-0 text-xs uppercase tracking-[0.22em] text-sky-200/75">
                                USDT
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Полноэкранный свечной график в стиле TradingView с таймфреймами, зумом и прокруткой.
              </p>
            </div>

            <div className="self-start rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              Live Chart
            </div>
          </div>

          <div className="min-h-[420px] flex-1 rounded-[1.3rem] border border-white/8 bg-[#020617]/60 p-2 sm:min-h-0 sm:rounded-[1.6rem] sm:p-3">
            <TradingViewAdvancedChart
              locale="ru"
              symbol={selectedCoin.tradingViewSymbol}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
