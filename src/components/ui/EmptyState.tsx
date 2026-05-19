interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-leaf-200 bg-leaf-50/50 px-6 py-16 text-center">
      <span className="mb-4 text-4xl" aria-hidden>
        🌱
      </span>
      <h3 className="text-lg font-semibold text-earth-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-earth-800/70">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
