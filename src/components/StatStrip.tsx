interface StatStripProps {
  totalFeatures: number;
  totalRequests: number;
  topCategory: string;
  mostRequested: string;
  loading?: boolean;
}

const stats = (props: StatStripProps) => [
  { value: props.totalFeatures, label: "Features" },
  { value: props.totalRequests, label: "Requests" },
  { value: props.topCategory, label: "Top category" },
  { value: props.mostRequested, label: "Most requested" },
];

const StatStrip = (props: StatStripProps) => {
  if (props.loading) {
    return (
      <div className="border border-border rounded-xl px-6 py-4 flex items-center gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-center gap-6">
            <div>
              <div className="skeleton-pulse h-5 w-10 mb-1 rounded" />
              <div className="skeleton-pulse h-3 w-16 rounded" />
            </div>
            {i < 3 && <div className="w-px h-8 bg-border shrink-0" />}
          </div>
        ))}
      </div>
    );
  }

  const items = stats(props);

  return (
    <div className="border border-border rounded-xl px-6 py-4 flex items-center divide-x divide-border overflow-x-auto">
      {items.map((s, i) => (
        <div key={i} className={`flex-1 min-w-0 ${i > 0 ? "pl-6" : ""} ${i < items.length - 1 ? "pr-6" : ""}`}>
          <div className="text-base font-semibold text-foreground truncate leading-tight">
            {s.value}
          </div>
          <div className="text-[11px] text-muted-foreground/60 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatStrip;
