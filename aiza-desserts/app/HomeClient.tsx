"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TradingViewAdvancedChart = dynamic(
  () =>
    import("./components/TradingViewAdvancedChart").then(
      (module) => module.TradingViewAdvancedChart,
    ),
  {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-[1.1rem] bg-[#020617]/40" />,
  },
);

type PurposeOption = "learn" | "coins" | "both" | null;
type PrinciplesOption = "yes" | "unsure" | null;
type Language = "ru" | "en";
type DashboardSection = "halal-coins" | "coin-check";

type CoinDefinition = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  tradingViewSymbol: string;
};

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  sparkline_in_7d?: {
    price: number[];
  };
  liveDataAvailable: boolean;
};

type SelectedCoin = MarketCoin | null;

type HalalCheckCoin = {
  symbol: string;
  name: string;
  image: string;
  aliases?: string[];
};

const HALAL_COIN_DEFINITIONS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
    tradingViewSymbol: "BINANCE:BTCUSDT",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    tradingViewSymbol: "BINANCE:ETHUSDT",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
    tradingViewSymbol: "BINANCE:SOLUSDT",
  },
  {
    id: "cosmos",
    symbol: "ATOM",
    name: "Cosmos",
    image: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
    tradingViewSymbol: "BINANCE:ATOMUSDT",
  },
  {
    id: "aptos",
    symbol: "APT",
    name: "Aptos",
    image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
    tradingViewSymbol: "BINANCE:APTUSDT",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    tradingViewSymbol: "BINANCE:LINKUSDT",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    tradingViewSymbol: "BINANCE:ADAUSDT",
  },
  {
    id: "trust-wallet-token",
    symbol: "TWT",
    name: "Trust Wallet Token",
    image: "https://assets.coingecko.com/coins/images/11085/large/Trust.png",
    tradingViewSymbol: "BINANCE:TWTUSDT",
  },
  {
    id: "oasis-network",
    symbol: "ROSE",
    name: "Oasis",
    image: "https://assets.coingecko.com/coins/images/13162/large/rose.png",
    tradingViewSymbol: "BINANCE:ROSEUSDT",
  },
  {
    id: "matic-network",
    symbol: "MATIC",
    name: "Polygon",
    image: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
    tradingViewSymbol: "BINANCE:POLUSDT",
  },
  {
    id: "layerzero",
    symbol: "ZRO",
    name: "LayerZero",
    image: "https://assets.coingecko.com/coins/images/28206/large/layerzero.png",
    tradingViewSymbol: "BINANCE:ZROUSDT",
  },
  {
    id: "celestia",
    symbol: "TIA",
    name: "Celestia",
    image: "https://assets.coingecko.com/coins/images/31967/large/tia.jpg",
    tradingViewSymbol: "BINANCE:TIAUSDT",
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    tradingViewSymbol: "BINANCE:AVAXUSDT",
  },
  {
    id: "the-open-network",
    symbol: "TON",
    name: "Toncoin",
    image: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png",
    tradingViewSymbol: "BINANCE:TONUSDT",
  },
  {
    id: "sui",
    symbol: "SUI",
    name: "Sui",
    image: "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg",
    tradingViewSymbol: "BINANCE:SUIUSDT",
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
    tradingViewSymbol: "BINANCE:LTCUSDT",
  },
  {
    id: "tron",
    symbol: "TRX",
    name: "TRON",
    image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
    tradingViewSymbol: "BINANCE:TRXUSDT",
  },
  {
    id: "virtual-protocol",
    symbol: "VIRTUAL",
    name: "Virtual Protocol",
    image: "https://assets.coingecko.com/coins/images/34170/large/virtual.jpeg",
    tradingViewSymbol: "BYBIT:VIRTUALUSDT",
  },
  {
    id: "mantle",
    symbol: "MNT",
    name: "Mantle",
    image: "https://assets.coingecko.com/coins/images/30980/large/Mantle.png",
    tradingViewSymbol: "BYBIT:MNTUSDT",
  },
] as const satisfies readonly CoinDefinition[];

const COIN_IDS = HALAL_COIN_DEFINITIONS.map((coin) => coin.id);
const TRADING_VIEW_SYMBOLS: Record<string, string> = Object.fromEntries(
  HALAL_COIN_DEFINITIONS.map((coin) => [
    coin.symbol.toLowerCase(),
    coin.tradingViewSymbol,
  ]),
);

const UI_TEXT = {
  ru: {
    liveDataUnavailable: "Данные в реальном времени недоступны",
    live: "В реальном времени",
    currentPrice: "Текущая цена",
    realTimeTrend: "Тренд в реальном времени",
    uptrend: "Восходящий тренд",
    pullback: "Откат",
    offline: "Оффлайн",
    back: "Назад",
    chartDescription:
      "Живой свечной график с таймфреймами прямо внутри приложения.",
    coinCheck: "Проверка монет",
    coinHalalCheck: "Проверка монеты на халяльность",
    coinCheckDescription:
      "Введите название или символ монеты из текущего списка проекта, чтобы проверить её внутренний статус.",
    coinExamplePlaceholder: "Например BTC или Ethereum",
    checkCoin: "Проверить монету",
    resultPlaceholder: "Результат проверки появится здесь.",
    noData: "Нет данных",
    coinNotFound: "Монета не найдена в halal list",
    coinNotFoundDescription:
      "Поиск не нашёл эту монету в локальном halal-списке.",
    halal: "Халяль",
    halalDescription:
      "Монета найдена в локальном halal-списке проекта и отмечена как халяльная в рамках этого раздела.",
    disclaimer: "Это не финансовый и не религиозный совет",
    terminal: "Халяльный терминал",
    dashboard: "Панель управления",
    dashboardDescription:
      "Премиальное пространство для работы с халяльными монетами поверх живого рыночного фона.",
    halalCoins: "Крипто монеты",
    searchCoin: "Поиск",
    signUp: "Зарегистрироваться",
    liveWatchlist: "Монеты в реальном времени",
    halalCoinsDescription: "Топ 20 лучших монет",
    coinCheckPanelDescription:
      "Проверяйте внутренний статус уже добавленных монет прямо внутри black/blue glass dashboard.",
    coinsCount: "монет",
  },
  en: {
    liveDataUnavailable: "Live data unavailable",
    live: "Live",
    currentPrice: "Current Price",
    realTimeTrend: "Real-Time Trend",
    uptrend: "Uptrend",
    pullback: "Pullback",
    offline: "Offline",
    back: "Back",
    chartDescription:
      "Live candlestick chart with timeframe controls inside the app.",
    coinCheck: "Coin Check",
    coinHalalCheck: "Coin Halal Check",
    coinCheckDescription:
      "Enter a coin name or symbol from the current project set to open its internal review status.",
    coinExamplePlaceholder: "For example BTC or Ethereum",
    checkCoin: "Check Coin",
    resultPlaceholder: "The review result will appear here.",
    noData: "No data",
    coinNotFound: "Coin not found in halal list",
    coinNotFoundDescription:
      "The search did not find this coin in the local halal list.",
    halal: "Halal",
    halalDescription:
      "This coin was found in the local halal list used by this project and is marked as halal in this section.",
    disclaimer: "This is not financial or religious advice",
    terminal: "Halal Terminal",
    dashboard: "Dashboard",
    dashboardDescription:
      "Premium halal coin workspace over your current live market background.",
    halalCoins: "Halal Coins",
    searchCoin: "Search",
    signUp: "Sign Up",
    liveWatchlist: "Live halal coin watchlist",
    halalCoinsDescription:
      "Real prices and live mini charts stay layered over your existing premium crypto background without changing the scene.",
    coinCheckPanelDescription:
      "Check the internal status of already listed project coins inside the same black/blue glass dashboard.",
    coinsCount: "coins",
  },
} as const;

const purposeOptions: Array<{ value: Exclude<PurposeOption, null>; label: string }> = [
  { value: "learn", label: "Изучать трейдинг" },
  { value: "coins", label: "Смотреть халяльные монеты" },
  { value: "both", label: "И то, и другое" },
];

const principlesOptions: Array<{
  value: Exclude<PrinciplesOption, null>;
  label: string;
}> = [
  { value: "yes", label: "Да, без рибы, плеча и фьючерсов" },
  { value: "unsure", label: "Не уверен" },
];

const agreementItems = [
  "Это не финансовая рекомендация",
  "Халяльность монет требует самостоятельной проверки",
  "Я понимаю риски и несу ответственность за свои решения",
];

const HALAL_CHECK_LIST: HalalCheckCoin[] = [
  { symbol: "BTC", name: "Bitcoin", image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400" },
  { symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "SOL", name: "Solana", image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756" },
  { symbol: "XRP", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", aliases: ["Ripple"] },
  { symbol: "ARB", name: "Arbitrum", image: "https://assets.coingecko.com/coins/images/16547/large/arb.jpg" },
  { symbol: "ATOM", name: "Cosmos", image: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg", aliases: ["Cosmos Hub"] },
  { symbol: "TRX", name: "TRON", image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png" },
  { symbol: "TWT", name: "Trust Wallet Token", image: "https://assets.coingecko.com/coins/images/11085/large/Trust.png" },
  { symbol: "ROSE", name: "Oasis", image: "https://assets.coingecko.com/coins/images/13162/large/rose.png", aliases: ["Oasis Network"] },
  { symbol: "POL", name: "Polygon", image: "https://assets.coingecko.com/coins/images/4713/large/polygon.png", aliases: ["MATIC", "POL / MATIC"] },
  { symbol: "VIRTUAL", name: "Virtual Protocol", image: "https://assets.coingecko.com/coins/images/34170/large/virtual.jpeg" },
  { symbol: "ADA", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { symbol: "ENS", name: "Ethereum Name Service", image: "https://assets.coingecko.com/coins/images/19785/large/acatxTm8_400x400.jpg", aliases: ["ENS"] },
  { symbol: "FIL", name: "Filecoin", image: "https://assets.coingecko.com/coins/images/12817/large/filecoin.png" },
  { symbol: "TON", name: "Toncoin", image: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png" },
  { symbol: "LTC", name: "Litecoin", image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { symbol: "SUI", name: "Sui", image: "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg" },
  { symbol: "GRASS", name: "Grass", image: "https://assets.coingecko.com/coins/images/53608/large/grass.png" },
  { symbol: "CGPT", name: "ChainGPT", image: "https://assets.coingecko.com/coins/images/29392/large/CGPT_LOGO_200x200.png" },
  { symbol: "ZRO", name: "LayerZero", image: "https://assets.coingecko.com/coins/images/28206/large/layerzero.png" },
  { symbol: "TIA", name: "Celestia", image: "https://assets.coingecko.com/coins/images/31967/large/tia.jpg" },
  { symbol: "MNT", name: "Mantle", image: "https://assets.coingecko.com/coins/images/30980/large/Mantle.png" },
  { symbol: "AVAX", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { symbol: "APT", name: "Aptos", image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png" },
  { symbol: "LINK", name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
  { symbol: "ENA", name: "Ethena", image: "https://assets.coingecko.com/coins/images/36530/large/ethena.png" },
];

function createFallbackCoins(): MarketCoin[] {
  return HALAL_COIN_DEFINITIONS.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    current_price: null,
    sparkline_in_7d: { price: [] },
    liveDataAvailable: false,
  }));
}

function mergeCoinsWithFallback(data: Array<Omit<MarketCoin, "liveDataAvailable">>) {
  const liveCoinsById = new Map(data.map((coin) => [coin.id, coin]));

  return HALAL_COIN_DEFINITIONS.map((fallbackCoin) => {
    const liveCoin = liveCoinsById.get(fallbackCoin.id);
    if (!liveCoin) {
      return {
        id: fallbackCoin.id,
        symbol: fallbackCoin.symbol,
        name: fallbackCoin.name,
        image: fallbackCoin.image,
        current_price: null,
        sparkline_in_7d: { price: [] },
        liveDataAvailable: false,
      };
    }

    return {
      id: liveCoin.id,
      symbol: (liveCoin.symbol || fallbackCoin.symbol).toUpperCase(),
      name: liveCoin.name || fallbackCoin.name,
      image: liveCoin.image || fallbackCoin.image,
      current_price:
        typeof liveCoin.current_price === "number" ? liveCoin.current_price : null,
      sparkline_in_7d: liveCoin.sparkline_in_7d ?? { price: [] },
      liveDataAvailable: typeof liveCoin.current_price === "number",
    };
  });
}

function formatCoinPrice(price: number | null, language: Language) {
  if (price === null) {
    return UI_TEXT[language].liveDataUnavailable;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
}

function OptionCard({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.1rem] border px-3.5 py-2.5 text-left text-[13px] leading-5 transition duration-300 sm:px-4 sm:py-3 sm:text-sm ${
        active
          ? "border-emerald-300/60 bg-emerald-400/12 text-white shadow-[0_0_24px_rgba(52,211,153,0.18)]"
          : "border-white/10 bg-white/[0.045] text-slate-300 hover:border-white/20 hover:bg-white/[0.07]"
      }`}
    >
      {label}
    </button>
  );
}

function BrandLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-2 font-semibold tracking-[-0.05em] text-white ${
        compact ? "text-xl sm:text-2xl" : "text-4xl sm:text-6xl"
      }`}
    >
      <span>Crypto</span>
      <span className="welcome-bitcoin-logo inline-flex items-center justify-center">
        <span className={compact ? "text-[1.5rem] leading-none sm:text-[2rem]" : "text-[2.4rem] leading-none sm:text-[3.4rem]"}>
          ₿
        </span>
      </span>
      <span>Trade</span>
    </span>
  );
}

function Sparkline({
  values,
  stroke,
}: {
  values: number[];
  stroke: string;
}) {
  const points = useMemo(() => {
    if (values.length < 2) {
      return "";
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values]);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-20 w-full">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function CoinCard({
  coin,
  language,
  onOpen,
}: {
  coin: MarketCoin;
  language: Language;
  onOpen: (coin: MarketCoin) => void;
}) {
  const prices = coin.sparkline_in_7d?.price ?? [];
  const first = prices[0] ?? coin.current_price ?? 0;
  const last = prices[prices.length - 1] ?? coin.current_price ?? 0;
  const positive = last >= first;
  const accent = positive ? "#34d399" : "#f87171";

  return (
    <button
      type="button"
      onClick={() => onOpen(coin)}
      className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.72),rgba(7,14,28,0.5))] p-5 text-left shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:border-sky-300/20 hover:bg-[linear-gradient(180deg,rgba(11,21,39,0.82),rgba(8,17,33,0.58))]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
            <Image
              src={coin.image}
              alt={`${coin.name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{coin.name}</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {coin.symbol}
            </p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-sky-200">
          {UI_TEXT[language].live}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          {UI_TEXT[language].currentPrice}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          {formatCoinPrice(coin.current_price, language)}
        </p>
      </div>

      <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/10 p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-400">
          <span>{UI_TEXT[language].realTimeTrend}</span>
          <span style={{ color: accent }}>
            {coin.liveDataAvailable
              ? positive
                ? UI_TEXT[language].uptrend
                : UI_TEXT[language].pullback
              : UI_TEXT[language].offline}
          </span>
        </div>
        {coin.liveDataAvailable && prices.length > 1 ? (
          <Sparkline values={prices} stroke={accent} />
        ) : (
          <div className="flex h-20 items-center justify-center rounded-[0.9rem] border border-dashed border-white/10 bg-white/[0.03] px-3 text-center text-xs leading-5 text-slate-400">
            {UI_TEXT[language].liveDataUnavailable}
          </div>
        )}
      </div>
    </button>
  );
}

function CoinDetailView({
  coin,
  language,
  onBack,
}: {
  coin: MarketCoin;
  language: Language;
  onBack: () => void;
}) {
  const tradingViewSymbol =
    TRADING_VIEW_SYMBOLS[coin.symbol.toLowerCase()] ??
    `BINANCE:${coin.symbol.toUpperCase()}USDT`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {UI_TEXT[language].back}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Image
                src={coin.image}
                alt={`${coin.name} logo`}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                {coin.name}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-sky-200/80">
                {coin.symbol}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            {UI_TEXT[language].currentPrice}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            {formatCoinPrice(coin.current_price, language)}
          </p>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,11,22,0.82),rgba(8,16,31,0.46))] p-4 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              TradingView
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {UI_TEXT[language].chartDescription}
            </p>
          </div>
          <div className="rounded-full border border-sky-300/18 bg-sky-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-sky-200">
            {tradingViewSymbol}
          </div>
        </div>

        <div className="h-[420px] rounded-[1.4rem] border border-white/8 bg-[#020617]/60 p-2 sm:h-[540px]">
          <TradingViewAdvancedChart locale={language} symbol={tradingViewSymbol} />
        </div>
      </div>
    </div>
  );
}

function CoinCheckPanel({
  language,
}: {
  language: Language;
}) {
  const [input, setInput] = useState("");

  const findCoin = (value: string) => {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    return (
      HALAL_CHECK_LIST.find((coin) => coin.symbol.toLowerCase() === normalized) ??
      HALAL_CHECK_LIST.find((coin) => coin.name.toLowerCase() === normalized) ??
      HALAL_CHECK_LIST.find((coin) =>
        coin.aliases?.some((alias) => alias.toLowerCase() === normalized),
      ) ??
      HALAL_CHECK_LIST.find(
        (coin) =>
          coin.symbol.toLowerCase().includes(normalized) ||
          coin.name.toLowerCase().includes(normalized) ||
          coin.aliases?.some((alias) => alias.toLowerCase().includes(normalized)),
      ) ??
      "not-found"
    );
  };
  const result = useMemo(() => findCoin(input), [input]);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.72),rgba(7,14,28,0.5))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-full border border-white/16 bg-white/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={UI_TEXT[language].coinExamplePlaceholder}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={() => void 0}
            className="rounded-full border border-sky-300/18 bg-sky-400/14 px-5 py-3 text-sm font-medium text-white shadow-[0_0_28px_rgba(56,189,248,0.12)] transition hover:bg-sky-400/18"
          >
            {UI_TEXT[language].checkCoin}
          </button>
        </div>

        <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-black/10 p-4">
          {result === null ? (
            <p className="text-sm leading-7 text-slate-400">
              {UI_TEXT[language].resultPlaceholder}
            </p>
          ) : result === "not-found" ? (
            <div className="rounded-[1rem] border border-white/10 bg-white/6 p-4">
              <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                {UI_TEXT[language].noData}
              </div>
              <p className="mt-4 text-base font-medium text-white">
                {UI_TEXT[language].coinNotFound}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {UI_TEXT[language].coinNotFoundDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <Image
                    src={result.image}
                    alt={`${result.name} logo`}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-sky-200/80">
                    {result.symbol}
                  </p>
                </div>
              </div>

              <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
                {UI_TEXT[language].halal}
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {UI_TEXT[language].halalDescription}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.72),rgba(7,14,28,0.5))] p-4">
          <h3 className="text-base font-semibold text-white">
            Халяль и харам в трейдинге
          </h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
            <p>
              Спотовая торговля обычно считается халяль, так как вы реально
              владеете активом (монетой) и отсутствуют проценты.
            </p>
            <p>
              Фьючерсная торговля может считаться харам, так как часто включает
              кредитное плечо, элементы процентов (риба) и высокую
              неопределённость, что может приравниваться к азарту.
            </p>
            <p>
              Перед инвестициями важно самостоятельно изучить проект и
              убедиться, что он соответствует исламским принципам.
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-slate-500">
          {UI_TEXT[language].disclaimer}
        </p>
      </div>
    </div>
  );
}

function Dashboard({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const [query, setQuery] = useState("");
  const [coins, setCoins] = useState<MarketCoin[]>(() => createFallbackCoins());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin>(null);
  const [section, setSection] = useState<DashboardSection>("halal-coins");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCoins = async () => {
      try {
        setError("");

        const params = new URLSearchParams({
          vs_currency: "usd",
          ids: COIN_IDS.join(","),
          sparkline: "true",
          price_change_percentage: "24h",
          locale: language === "ru" ? "ru" : "en",
        });

        const apiKey = process.env.NEXT_PUBLIC_COINGECKO_DEMO_API_KEY;
        if (apiKey) {
          params.set("x_cg_demo_api_key", apiKey);
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("market_fetch_failed");
        }

        const data = (await response.json()) as Array<
          Omit<MarketCoin, "liveDataAvailable">
        >;

        if (!active) {
          return;
        }

        setCoins(mergeCoinsWithFallback(data));
      } catch {
        if (!active) {
          return;
        }

        setCoins(createFallbackCoins());
        setError(UI_TEXT[language].liveDataUnavailable);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCoins();
    const interval = window.setInterval(loadCoins, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [language]);

  const filteredCoins = useMemo(() => {
    if (!query.trim()) {
      return coins;
    }

    const normalized = query.toLowerCase();
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(normalized) ||
        coin.symbol.toLowerCase().includes(normalized),
    );
  }, [coins, query]);

  useEffect(() => {
    if (!selectedCoin) {
      return;
    }

    const updated = coins.find((coin) => coin.id === selectedCoin.id);
    if (updated) {
      setSelectedCoin(updated);
    }
  }, [coins, selectedCoin]);

  return (
    <main className="min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1520px] gap-3 overflow-hidden lg:h-[calc(100vh-3rem)] lg:gap-6">
        <aside className="sticky top-4 hidden h-full w-[260px] shrink-0 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.78),rgba(12,25,48,0.5))] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-xl lg:flex lg:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-sky-200/75">
              {UI_TEXT[language].terminal}
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => {
                setSection("halal-coins");
                setSelectedCoin(null);
                setIsMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-left transition ${
                section === "halal-coins"
                  ? "border-sky-300/18 bg-sky-400/10 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                  : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${section === "halal-coins" ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]" : "bg-slate-500"}`} />
              <span className="text-sm font-medium text-white">{UI_TEXT[language].halalCoins}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSection("coin-check");
                setSelectedCoin(null);
                setIsMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-left transition ${
                section === "coin-check"
                  ? "border-sky-300/18 bg-sky-400/10 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                  : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${section === "coin-check" ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]" : "bg-slate-500"}`} />
              <span className="text-sm font-medium text-white">{UI_TEXT[language].coinCheck}</span>
            </button>
            <Link
              href="/trading"
              className="flex w-full items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              <span className="text-sm font-medium text-white">Спотовая торговля</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6">
            <Link
              href="/support"
              className="flex w-full items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="text-sm leading-none text-sky-200">🎧</span>
              <span className="text-sm font-medium text-white">Поддержка</span>
            </Link>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 lg:gap-6">
          <header className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,24,0.76),rgba(11,20,38,0.48))] p-4 shadow-[0_20px_60px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <span className="text-base leading-none">☰</span>
                  <span>Меню</span>
                </button>

                <div className="flex rounded-full border border-white/10 bg-white/6 p-1">
                  {(["ru", "en"] as Language[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onLanguageChange(item)}
                      className={`rounded-full px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                        language === item
                          ? "bg-sky-400/16 text-white shadow-[0_0_20px_rgba(56,189,248,0.16)]"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {isMobileMenuOpen ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.88),rgba(7,14,28,0.74))] p-3 lg:hidden">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSection("halal-coins");
                        setSelectedCoin(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[1rem] border px-4 py-3 text-left transition ${
                        section === "halal-coins"
                          ? "border-sky-300/18 bg-sky-400/10 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                          : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${section === "halal-coins" ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]" : "bg-slate-500"}`} />
                      <span className="text-sm font-medium text-white">{UI_TEXT[language].halalCoins}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSection("coin-check");
                        setSelectedCoin(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[1rem] border px-4 py-3 text-left transition ${
                        section === "coin-check"
                          ? "border-sky-300/18 bg-sky-400/10 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                          : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${section === "coin-check" ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]" : "bg-slate-500"}`} />
                      <span className="text-sm font-medium text-white">{UI_TEXT[language].coinCheck}</span>
                    </button>

                    <Link
                      href="/trading"
                      className="flex w-full items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                      <span className="text-sm font-medium text-white">Спотовая торговля</span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex w-full items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      <span className="text-sm leading-none text-sky-200">🎧</span>
                      <span className="text-sm font-medium text-white">Поддержка</span>
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="w-full max-w-xl rounded-full border border-white/16 bg-white/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={UI_TEXT[language].searchCoin}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-3 lg:flex">
                <div className="flex rounded-full border border-white/10 bg-white/6 p-1">
                  {(["ru", "en"] as Language[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onLanguageChange(item)}
                      className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] transition ${
                        language === item
                          ? "bg-sky-400/16 text-white shadow-[0_0_20px_rgba(56,189,248,0.16)]"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-300/18 bg-sky-400/14 text-white shadow-[0_0_28px_rgba(56,189,248,0.12)] transition hover:bg-sky-400/18"
                  aria-label="Открыть регистрацию"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                </Link>
              </div>
            </div>
          </header>

          <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,11,22,0.68),rgba(8,16,31,0.38))] p-4 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200/75">
                  {section === "halal-coins" ? UI_TEXT[language].halalCoins : UI_TEXT[language].coinCheck}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {section === "halal-coins" ? UI_TEXT[language].liveWatchlist : UI_TEXT[language].coinHalalCheck}
                </h1>
                {section === "halal-coins" ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    {UI_TEXT[language].halalCoinsDescription}
                  </p>
                ) : null}
              </div>
              {section === "halal-coins" ? (
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                  {filteredCoins.length} {UI_TEXT[language].coinsCount}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              {section === "coin-check" ? (
                <CoinCheckPanel language={language} />
              ) : loading ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[260px] animate-pulse rounded-[1.6rem] border border-white/10 bg-white/6"
                    />
                  ))}
                </div>
              ) : selectedCoin ? (
                <CoinDetailView
                  coin={selectedCoin}
                  language={language}
                  onBack={() => setSelectedCoin(null)}
                />
              ) : (
                <div className="space-y-4">
                  {error ? (
                    <div className="rounded-[1.4rem] border border-amber-300/18 bg-amber-400/8 p-4 text-sm leading-7 text-amber-100">
                      {error}
                    </div>
                  ) : null}
                  <div className="grid gap-4 lg:grid-cols-3">
                    {filteredCoins.map((coin) => (
                      <CoinCard
                        key={coin.id}
                        coin={coin}
                        language={language}
                        onOpen={setSelectedCoin}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const openDashboardDirectly = searchParams.get("screen") === "dashboard";
  const [purpose, setPurpose] = useState<PurposeOption>(null);
  const [principles, setPrinciples] = useState<PrinciplesOption>(null);
  const [agreements, setAgreements] = useState([false, false, false]);
  const [showDashboard, setShowDashboard] = useState(openDashboardDirectly);
  const [showOnboarding, setShowOnboarding] = useState(openDashboardDirectly);
  const [warning, setWarning] = useState("");
  const [language, setLanguage] = useState<Language>("ru");

  const toggleAgreement = (index: number) => {
    setAgreements((current) =>
      current.map((checked, itemIndex) =>
        itemIndex === index ? !checked : checked,
      ),
    );
    setWarning("");
  };

  const handleContinue = () => {
    if (!purpose || !principles) {
      setWarning("Выберите ответы на первые два вопроса, чтобы продолжить.");
      return;
    }

    if (!agreements.every(Boolean)) {
      setWarning("Примите все обязательные условия перед продолжением.");
      return;
    }

    if (principles !== "yes") {
      setWarning("Доступ открывается только если вы согласны следовать халяльным принципам.");
      return;
    }

    setWarning("");
    setShowDashboard(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Link
        href="/"
        className="fixed left-4 top-4 z-30 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,26,0.72),rgba(10,20,38,0.4))] px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:border-sky-300/18 hover:bg-[linear-gradient(180deg,rgba(8,17,32,0.82),rgba(12,25,46,0.5))] sm:left-6 sm:top-6"
      >
        <BrandLogo compact />
      </Link>

      <div
        className={`transition-all duration-700 ease-out ${
          showDashboard
            ? "translate-y-0 opacity-100 blur-0"
            : "pointer-events-none translate-y-6 opacity-0 blur-sm"
        }`}
      >
        <Dashboard language={language} onLanguageChange={setLanguage} />
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center px-4 py-4 transition-all duration-700 ease-out sm:px-6 sm:py-6 ${
          showDashboard || !showOnboarding
            ? "pointer-events-none translate-y-4 opacity-0 blur-md"
            : "translate-y-0 opacity-100 blur-0"
        }`}
      >
        <section className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[1.7rem] border border-white/10 bg-white/7 px-5 py-5 shadow-[0_24px_90px_rgba(2,6,23,0.5)] backdrop-blur-xl sm:max-h-[calc(100vh-3rem)] sm:px-6 sm:py-6">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.26em] text-emerald-200 sm:text-[11px]">
              Онбординг
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:mt-4 sm:text-4xl">
              Перед началом
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-300 sm:text-sm sm:leading-6">
              Сайт посвящён халяльному трейдингу и халяльным монетам.
              Ответьте на несколько вопросов, чтобы открыть полный интерфейс.
            </p>
          </div>

          <div className="mt-4 space-y-4 sm:mt-5">
            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-200 sm:text-sm">
                1. Для чего вы используете сайт?
              </p>
              <div className="grid gap-2">
                {purposeOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    active={purpose === option.value}
                    label={option.label}
                    onClick={() => {
                      setPurpose(option.value);
                      setWarning("");
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-200 sm:text-sm">
                2. Готовы ли вы придерживаться халяльных принципов?
              </p>
              <div className="grid gap-2">
                {principlesOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    active={principles === option.value}
                    label={option.label}
                    onClick={() => {
                      setPrinciples(option.value);
                      setWarning("");
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-200 sm:text-sm">
                3. Согласны ли вы с условиями?
              </p>
              <div className="space-y-2">
                {agreementItems.map((item, index) => (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-[1rem] border px-3.5 py-2.5 transition duration-300 sm:px-4 sm:py-3 ${
                      agreements[index]
                        ? "border-emerald-300/50 bg-emerald-400/10 shadow-[0_0_24px_rgba(52,211,153,0.14)]"
                        : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements[index]}
                      onChange={() => toggleAgreement(index)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-emerald-400"
                    />
                    <span className="text-[13px] leading-5 text-slate-200 sm:text-sm sm:leading-5">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-[13px] text-rose-200 sm:text-sm">
              {warning ? (
                <p className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1.5 text-center sm:text-left">
                  {warning}
                </p>
              ) : (
                <p className="text-slate-400">
                  Продолжение откроется после заполнения всех обязательных пунктов.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="rounded-full border border-emerald-300/40 bg-emerald-400/12 px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_0_26px_rgba(52,211,153,0.18)] transition hover:bg-emerald-400/18 sm:text-sm"
            >
              Продолжить
            </button>
          </div>
        </section>
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center px-4 py-4 transition-all duration-700 ease-out sm:px-6 sm:py-6 ${
          showOnboarding
            ? "pointer-events-none -translate-y-4 opacity-0 blur-md"
            : "translate-y-0 opacity-100 blur-0"
        }`}
      >
        <section className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/7 px-6 py-8 text-center shadow-[0_24px_90px_rgba(2,6,23,0.5)] backdrop-blur-xl sm:px-10 sm:py-10">
          <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-sky-200">
            Crypto Trade
          </span>
          <h1 className="mt-6 flex justify-center">
            <BrandLogo />
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Инвестируйте и торгуйте криптовалютами халяльным способом.
            Найдите дозволенные монеты и принимайте уверенные решения.
          </p>
          <ul className="mx-auto mt-6 max-w-2xl space-y-3 text-left text-sm leading-7 text-slate-300 sm:text-base">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.45)]" />
              <span>Отслеживайте графики монет в реальном времени</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.45)]" />
              <span>Проверяйте криптовалюты на соответствие халяльным принципам</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.45)]" />
              <span>Открывайте лучшие монеты для инвестиций</span>
            </li>
          </ul>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="rounded-full border border-sky-300/24 bg-sky-400/14 px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(56,189,248,0.14)] transition hover:bg-sky-400/18 sm:text-base"
            >
              Продолжить
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


