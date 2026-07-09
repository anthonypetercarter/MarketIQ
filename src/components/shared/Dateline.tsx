export function Dateline({ label, updatedAt }: { label: string; updatedAt: Date }) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(updatedAt);

  return (
    <div className="text-ink-500 text-eyebrow mb-5 flex items-center justify-between tracking-[0.1em] uppercase">
      <span>{label}</span>
      <span>Updated {formattedTime}</span>
    </div>
  );
}
