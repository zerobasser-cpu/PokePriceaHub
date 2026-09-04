"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  PriceHistoryRecord,
  PriceHistoryRange,
} from "@/lib/database";

type Props = {
  history: PriceHistoryRecord[];
};

type ChartPoint = {
  date: string;
  label: string;
  price: number;
};

const RANGE_OPTIONS: {
  value: PriceHistoryRange;
  label: string;
}[] = [
  {
    value: "7d",
    label: "7D",
  },
  {
    value: "30d",
    label: "30D",
  },
  {
    value: "90d",
    label: "90D",
  },
  {
    value: "1y",
    label: "1Y",
  },
  {
    value: "all",
    label: "ALL",
  },
];

function formatPrice(
  value: number | null | undefined
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `£${value.toFixed(2)}`;
}

function formatDate(
  value: string
): string {
  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatShortDate(
  value: string
): string {
  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function getRecordDate(
  record: PriceHistoryRecord
): string {
  /*
  ----------------------------------------------------------
  The database uses snapshotDate internally.

  This helper keeps the component tolerant of older records
  that may expose snapshot_date.
  ----------------------------------------------------------
  */

  const item =
    record as PriceHistoryRecord & {
      snapshot_date?: string;
    };

  return (
    item.snapshotDate ??
    item.snapshot_date ??
    ""
  );
}

function getRecordAverage(
  record: PriceHistoryRecord
): number | null {
  const value =
    record.average;

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function buildChartPoints(
  history: PriceHistoryRecord[]
): ChartPoint[] {
  return history
    .map((record) => {
      const date =
        getRecordDate(record);

      const price =
        getRecordAverage(record);

      if (!date || price === null) {
        return null;
      }

      return {
        date,
        label:
          formatShortDate(date),
        price,
      };
    })
    .filter(
      (
        point
      ): point is ChartPoint =>
        point !== null
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(
          b.date
        )
    );
}

function filterHistory(
  history: PriceHistoryRecord[],
  range: PriceHistoryRange
): PriceHistoryRecord[] {
  if (
    range === "all" ||
    history.length === 0
  ) {
    return history;
  }

  const days =
    range === "7d"
      ? 7
      : range === "30d"
        ? 30
        : range === "90d"
          ? 90
          : 365;

  const cutoff =
    new Date();

  cutoff.setDate(
    cutoff.getDate() - days
  );

  const cutoffString =
    cutoff
      .toISOString()
      .slice(0, 10);

  return history.filter(
    (record) =>
      getRecordDate(record) >=
      cutoffString
  );
}

function createSmoothPath(
  points: {
    x: number;
    y: number;
  }[]
): string {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x} ${points[0].y}`;

  for (
    let i = 1;
    i < points.length;
    i++
  ) {
    const previous =
      points[i - 1];

    const current =
      points[i];

    const controlX =
      (previous.x +
        current.x) /
      2;

    path +=
      ` C ${controlX} ${previous.y}, ` +
      `${controlX} ${current.y}, ` +
      `${current.x} ${current.y}`;
  }

  return path;
}

export default function PriceHistoryChart({
  history,
}: Props) {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<PriceHistoryRange>(
      "30d"
    );

  const filteredHistory =
    useMemo(
      () =>
        filterHistory(
          history,
          selectedRange
        ),
      [
        history,
        selectedRange,
      ]
    );

  const points =
    useMemo(
      () =>
        buildChartPoints(
          filteredHistory
        ),
      [filteredHistory]
    );

  const statistics =
    useMemo(() => {
      if (!points.length) {
        return {
          current: null,
          previous: null,
          high: null,
          low: null,
          change: null,
          changePercent: null,
        };
      }

      const prices =
        points.map(
          (point) =>
            point.price
        );

      const current =
        prices[
          prices.length - 1
        ];

      const previous =
        prices.length > 1
          ? prices[
              prices.length - 2
            ]
          : null;

      const high =
        Math.max(...prices);

      const low =
        Math.min(...prices);

      const first =
        prices[0];

      const change =
        prices.length > 1
          ? current - first
          : null;

      const changePercent =
        change !== null &&
        first > 0
          ? (change / first) * 100
          : null;

      return {
        current,
        previous,
        high,
        low,
        change,
        changePercent,
      };
    }, [points]);

  const svgPoints =
    useMemo(() => {
      if (!points.length) {
        return [];
      }

      const width = 900;
      const height = 300;

      const paddingLeft = 60;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 45;

      const chartWidth =
        width -
        paddingLeft -
        paddingRight;

      const chartHeight =
        height -
        paddingTop -
        paddingBottom;

      const prices =
        points.map(
          (point) =>
            point.price
        );

      let min =
        Math.min(...prices);

      let max =
        Math.max(...prices);

      if (min === max) {
        min = Math.max(
          0,
          min - 5
        );

        max += 5;
      }

      const padding =
        (max - min) * 0.12;

      min =
        Math.max(
          0,
          min - padding
        );

      max += padding;

      return points.map(
        (point, index) => {
          const x =
            points.length === 1
              ? paddingLeft +
                chartWidth / 2
              : paddingLeft +
                (index /
                  (points.length - 1)) *
                  chartWidth;

          const y =
            paddingTop +
            (1 -
              (point.price - min) /
                (max - min)) *
              chartHeight;

          return {
            ...point,
            x,
            y,
          };
        }
      );
    }, [points]);

  const path =
    createSmoothPath(
      svgPoints
    );

  const areaPath =
    svgPoints.length
      ? `${path} L ${svgPoints[svgPoints.length - 1].x} 255 L ${svgPoints[0].x} 255 Z`
      : "";

  const isPositive =
    typeof statistics.change ===
      "number" &&
    statistics.change >= 0;

  return (
    <section className="price-history-panel">
      <div className="price-history-header">
        <div>
          <h2 className="price-history-title">
            Price History
          </h2>

          <p className="price-history-subtitle">
            Historical combined market price
          </p>
        </div>

        <div className="price-history-range">
          {RANGE_OPTIONS.map(
            (option) => (
              <button
                key={option.value}
                type="button"
                className={
                  selectedRange ===
                  option.value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedRange(
                    option.value
                  )
                }
              >
                {option.label}
              </button>
            )
          )}
        </div>
      </div>

      {!points.length ? (
        <div className="price-history-empty">
          <div>
            <strong>
              No price history yet
            </strong>

            <div>
              Price snapshots will appear
              here as cards are viewed and
              their prices are updated.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="price-history-chart">
            <svg
              viewBox="0 0 900 300"
              width="100%"
              height="300"
              role="img"
              aria-label="Price history chart"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="priceHistoryFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(255,203,5,0.24)"
                  />

                  <stop
                    offset="100%"
                    stopColor="rgba(255,203,5,0)"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map(
                (line) => {
                  const y =
                    20 +
                    line *
                      55;

                  return (
                    <line
                      key={line}
                      x1="60"
                      x2="880"
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="1"
                    />
                  );
                }
              )}

              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#priceHistoryFill)"
                />
              )}

              {path && (
                <path
                  d={path}
                  fill="none"
                  stroke="var(--pika-yellow)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {svgPoints.map(
                (point, index) => (
                  <circle
                    key={`${point.date}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="var(--pika-yellow)"
                    stroke="var(--surface-strong)"
                    strokeWidth="2"
                  >
                    <title>
                      {formatDate(
                        point.date
                      )}
                      {" — "}
                      {formatPrice(
                        point.price
                      )}
                    </title>
                  </circle>
                )
              )}

              {svgPoints.length > 0 && (
                <>
                  <text
                    x="60"
                    y="285"
                    fill="var(--text-muted)"
                    fontSize="11"
                  >
                    {formatShortDate(
                      svgPoints[0].date
                    )}
                  </text>

                  <text
                    x="880"
                    y="285"
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontSize="11"
                  >
                    {formatShortDate(
                      svgPoints[
                        svgPoints.length - 1
                      ].date
                    )}
                  </text>
                </>
              )}
            </svg>
          </div>

          <div className="price-history-summary">
            <div className="price-history-stat">
              <span className="price-history-stat-label">
                Current
              </span>

              <span className="price-history-stat-value">
                {formatPrice(
                  statistics.current
                )}
              </span>
            </div>

            <div className="price-history-stat">
              <span className="price-history-stat-label">
                High
              </span>

              <span className="price-history-stat-value">
                {formatPrice(
                  statistics.high
                )}
              </span>
            </div>

            <div className="price-history-stat">
              <span className="price-history-stat-label">
                Low
              </span>

              <span className="price-history-stat-value">
                {formatPrice(
                  statistics.low
                )}
              </span>
            </div>

            <div
              className={`price-history-stat ${
                statistics.change !==
                  null
                  ? isPositive
                    ? "positive"
                    : "negative"
                  : ""
              }`}
            >
              <span className="price-history-stat-label">
                Movement
              </span>

              <span className="price-history-stat-value">
                {statistics.change ===
                null
                  ? "—"
                  : `${isPositive ? "+" : ""}${formatPrice(
                      statistics.change
                    )} ${
                      statistics.changePercent !==
                      null
                        ? `(${isPositive ? "+" : ""}${statistics.changePercent.toFixed(
                            1
                          )}%)`
                        : ""
                    }`}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}