export default function StatCard({
  label,
  value,
}: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="card-section">
        <p className="text-sm text-neutral-600">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}
