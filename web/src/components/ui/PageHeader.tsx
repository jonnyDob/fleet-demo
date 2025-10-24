export default function PageHeader({
  title,
  subtitle,
  right,
}: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
