import { clsx } from "clsx";

const controlClass =
  "w-full rounded-md border border-border bg-panel-raised px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none";

export function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-reliability-contradictory">{error}</p> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(controlClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(controlClass, "min-h-24", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(controlClass, props.className)} />;
}
