export default function DashboardSkeleton() {
  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto space-y-4 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-20 bg-card rounded" />
        <div className="h-9 w-16 bg-card rounded" />
      </div>
      <div className="h-28 bg-card rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-card rounded-3xl" />
        <div className="h-24 bg-card rounded-3xl" />
      </div>
      <div className="h-24 bg-card rounded-3xl" />
    </div>
  );
}
