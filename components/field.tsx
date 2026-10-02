import { ChevronDown, X } from "lucide-react";

/** One bordered row of the cover's form box: printed label cell, then the line you write on. */
function Row({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid border-b border-spot/40 focus-within:shadow-[inset_0_0_0_2px_hsl(var(--ballpoint))] sm:grid-cols-[8.5rem_1fr]">
      <label htmlFor={htmlFor} className="px-4 pt-3 text-[0.8125rem] font-medium text-spot sm:flex sm:items-center sm:border-e sm:border-spot/40 sm:py-0">
        {label}
      </label>
      <div className="min-w-0 px-4">
        {children}
        {hint && (
          <p id={`${htmlFor}-hint`} className="-mt-1 pb-2.5 text-xs text-spot">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

// What the student writes goes down in ballpoint blue.
const control =
  "h-12 w-full bg-transparent text-base font-medium text-ballpoint outline-none disabled:cursor-not-allowed disabled:text-spot";

export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.ComponentProps<"input"> & { id: string }) {
  return (
    <Row htmlFor={props.id} label={label} hint={hint}>
      <input {...props} dir="auto" aria-describedby={hint ? `${props.id}-hint` : undefined} className={control} />
    </Row>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string } & React.ComponentProps<"select"> & { id: string }) {
  return (
    <Row htmlFor={props.id} label={label}>
      <div className="relative">
        <select {...props} className={`${control} cursor-pointer appearance-none pe-7 has-[option[value='']:checked]:font-normal has-[option[value='']:checked]:text-spot`}>
          {children}
        </select>
        <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute end-0 top-1/2 size-4 -translate-y-1/2 text-spot" />
      </div>
    </Row>
  );
}

/** A red-pen mark: the problem, stated plainly. */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 border-b border-spot/40 px-4 py-3 text-sm text-pen">
      <X aria-hidden strokeWidth={2.5} className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** The cover's solid action box. */
export function SubmitButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="submit"
      {...props}
      className="h-14 w-full bg-cover text-base font-semibold text-cover-ink transition-colors hover:bg-cover/90 disabled:cursor-progress disabled:opacity-70"
    >
      {children}
    </button>
  );
}

/** Small printed line under the form box. */
export function PanelNote({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-4 text-sm text-spot">{children}</p>;
}

/**
 * The cover: a monumental title and printed instructions on the green field,
 * and the white label box whose rows are the real form.
 */
export function AuthPanel({
  title,
  description,
  caption,
  notes,
  children,
}: {
  title: string;
  description?: string;
  caption?: string;
  notes?: { title: string; items: string[] };
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-20">
      <div className="grid content-start gap-6">
        <h1 className="text-balance text-[clamp(2.75rem,8vw,5.25rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
          {title}
        </h1>
        {description && <p className="max-w-[34rem] text-lg leading-relaxed text-cover-soft">{description}</p>}
        {notes && (
          <section className="mt-4 max-w-[34rem] border border-cover-ink/50">
            <h2 className="border-b border-cover-ink/50 px-4 py-2 text-sm font-semibold">{notes.title}</h2>
            <ol className="grid gap-2 px-4 py-3 text-[0.9375rem] leading-relaxed text-cover-soft [counter-reset:note]">
              {notes.items.map((item) => (
                <li key={item} className="grid grid-cols-[1.5rem_1fr] [counter-increment:note] before:font-semibold before:text-cover-ink before:content-[counter(note)] rtl:before:content-[counter(note,arabic-indic)]">
                  {item}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
      <div className="sheet bg-paper text-print shadow-sheet">
        {caption && <p className="border-b-2 border-print px-4 py-3 text-sm font-semibold">{caption}</p>}
        {children}
      </div>
    </div>
  );
}

export const linkClass = "font-medium text-ballpoint underline underline-offset-4 hover:no-underline";
