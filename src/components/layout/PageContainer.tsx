export default function PageContainer({ title, children, description, action }: { title: string, children: React.ReactNode, description?: string, action?: React.ReactNode }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {description && <p className="text-slate-500 mt-1 text-sm">{description}</p>}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-1 sm:p-2 lg:p-4">
           {children}
        </div>
      </div>
    </div>
  );
}
