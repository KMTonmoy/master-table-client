"use client";

type SparklineProps = {
  data: number[];
  compare: number[];
};

export default function Sparkline({ data, compare }: SparklineProps) {
  const w = 900;
  const h = 260;
  const pad = 24;

  const max = Math.max(...data, ...compare, 1);
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);

  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const areaPath =
    toPath(data) +
    ` L ${(pad + (data.length - 1) * stepX).toFixed(1)} ${h - pad}` +
    ` L ${pad} ${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-64 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#revFill)" />
      <path
        d={toPath(compare)}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.6"
      />
      <path
        d={toPath(data)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
