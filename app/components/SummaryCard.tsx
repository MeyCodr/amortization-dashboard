type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  accent: "blue" | "green" | "amber" | "red" | "purple";
  icon: React.ReactNode;
};

const accentStyles = {
  blue: "border-blue-500 bg-blue-50 text-blue-700",
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
  purple: "border-purple-500 bg-purple-50 text-purple-700",
};

const iconStyles = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  purple: "bg-purple-100 text-purple-600",
};

export default function SummaryCard({ title, value, subtitle, accent, icon }: SummaryCardProps) {
  return (
    <div className={`rounded-xl border-l-4 bg-white shadow-sm p-5 flex gap-4 items-start ${accentStyles[accent].split(" ").slice(0, 1).join(" ")}`}>
      <div className={`rounded-lg p-3 shrink-0 ${iconStyles[accent]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
