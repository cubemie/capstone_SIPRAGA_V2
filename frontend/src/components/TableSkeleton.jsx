export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-slate-200 rounded flex-1" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}