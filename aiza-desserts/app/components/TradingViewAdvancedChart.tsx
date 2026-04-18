"use client";

import { useEffect, useId, useRef } from "react";

type TradingViewAdvancedChartProps = {
  locale: "ru" | "en";
  symbol: string;
};

export function TradingViewAdvancedChart({
  locale,
  symbol,
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useId().replace(/:/g, "");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetTarget = document.createElement("div");
    widgetTarget.className = "tradingview-widget-container__widget";
    widgetTarget.id = `tradingview_${widgetId}`;
    widgetTarget.style.height = "calc(100% - 32px)";
    widgetTarget.style.width = "100%";

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Chart by TradingView</span></a>';

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.innerHTML = JSON.stringify({
      autosize: true,
      container_id: `tradingview_${widgetId}`,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      backgroundColor: "rgba(2, 6, 23, 0)",
      gridColor: "rgba(148, 163, 184, 0.08)",
      hide_top_toolbar: false,
      support_host: "https://www.tradingview.com",
    });

    widgetContainer.appendChild(widgetTarget);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);

    return () => {
      container.innerHTML = "";
    };
  }, [locale, symbol, widgetId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
