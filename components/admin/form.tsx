'use client';

import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { IDLE_STATE, type FormState } from '@/lib/admin/form-state';
import { cn } from '@/lib/cn';

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const FormStateContext = createContext<FormState>(IDLE_STATE);

/**
 * An admin form bound to a server action. It shares the action's result with its fields (so each
 * shows its own error and keeps what was typed), announces the outcome politely, and moves focus
 * to the first invalid field after a failed save.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  readonly action: Action;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const [state, formAction] = useActionState(action, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'error')
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={cn('space-y-8', className)} noValidate>
      <FormStateContext.Provider value={state}>{children}</FormStateContext.Provider>
    </form>
  );
}

function useField(name: string) {
  const state = useContext(FormStateContext);
  const id = useId();
  return {
    id,
    error: state.fieldErrors?.[name],
    submitted: state.values,
  };
}

const inputClass =
  'block w-full rounded-md border border-latte-500/60 bg-cream-50 px-3.5 py-2.5 text-body text-foreground transition-colors placeholder:text-muted/70 hover:border-latte-500 focus-visible:border-mocha-700 aria-[invalid=true]:border-danger';

function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-small font-medium text-foreground">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-meta text-muted">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-meta font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, hint: unknown, error: unknown) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

interface TextFieldProps {
  readonly name: string;
  readonly label: string;
  readonly defaultValue?: string | number | null;
  readonly hint?: ReactNode;
  readonly type?: 'text' | 'email' | 'url' | 'tel' | 'time' | 'date' | 'password';
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'url' | 'tel';
  readonly autoComplete?: string;
  readonly className?: string;
}

export function TextField({
  name,
  label,
  defaultValue,
  hint,
  type = 'text',
  className,
  ...rest
}: TextFieldProps) {
  const { id, error, submitted } = useField(name);
  const value = submitted ? (submitted[name] ?? '') : (defaultValue ?? '');
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={String(value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClass}
        {...rest}
      />
    </FieldFrame>
  );
}

export function TextAreaField({
  name,
  label,
  defaultValue,
  hint,
  rows = 4,
  maxLength,
  className,
  monospace = false,
}: {
  readonly name: string;
  readonly label: string;
  readonly defaultValue?: string;
  readonly hint?: ReactNode;
  readonly rows?: number;
  readonly maxLength?: number;
  readonly className?: string;
  readonly monospace?: boolean;
}) {
  const { id, error, submitted } = useField(name);
  const value = submitted ? (submitted[name] ?? '') : (defaultValue ?? '');
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputClass, 'leading-relaxed', monospace && 'font-mono text-small')}
      />
    </FieldFrame>
  );
}

export function SelectField({
  name,
  label,
  defaultValue,
  options,
  hint,
  className,
}: {
  readonly name: string;
  readonly label: string;
  readonly defaultValue?: string | number | null;
  readonly options: readonly { value: string | number; label: string }[];
  readonly hint?: ReactNode;
  readonly className?: string;
}) {
  const { id, error, submitted } = useField(name);
  const value = submitted ? (submitted[name] ?? '') : String(defaultValue ?? '');
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={name}
        defaultValue={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputClass, 'pr-10')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
  value,
}: {
  readonly name: string;
  readonly label: string;
  readonly defaultChecked?: boolean;
  readonly hint?: ReactNode;
  /** For checkbox groups sharing one name. */
  readonly value?: string;
}) {
  const { id, error, submitted } = useField(value ? `${name}:${value}` : name);
  const checked = submitted
    ? submitted[value ? `${name}:${value}` : name] === 'on'
    : Boolean(defaultChecked);
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          value={value}
          defaultChecked={checked}
          className="mt-0.5 size-5 shrink-0 accent-[rgb(var(--cef-color-mocha-700-rgb))]"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span>
          <span className="block text-small font-medium text-foreground">{label}</span>
          {hint ? (
            <span id={`${id}-hint`} className="mt-0.5 block text-meta text-muted">
              {hint}
            </span>
          ) : null}
        </span>
      </label>
      {error ? <p className="mt-1.5 text-meta font-medium text-danger">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ label }: { readonly label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Mentés…' : label}
    </Button>
  );
}

/** The form's footer: the save button and the announced outcome of the last save. */
export function FormFooter({
  submitLabel = 'Mentés',
  inline = false,
}: {
  readonly submitLabel?: string;
  /** Inline sits in the flow (short forms); otherwise the bar sticks to the bottom of the viewport. */
  readonly inline?: boolean;
}) {
  const state = useContext(FormStateContext);
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4',
        !inline &&
          'sticky bottom-0 z-10 -mx-4 border-t border-border bg-cream-100 px-4 py-4 sm:-mx-8 sm:px-8',
      )}
    >
      <SubmitButton label={submitLabel} />
      <p
        role="status"
        aria-live="polite"
        className={cn(
          'text-small',
          state.status === 'error' ? 'font-medium text-danger' : 'text-forest-700',
        )}
      >
        {state.status === 'idle' ? '' : state.message}
      </p>
    </div>
  );
}

/** A titled group of fields inside a long form. */
export function FieldGroup({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-6 rounded-lg bg-cream-50 p-5 shadow-sm sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <p className="font-serif text-h4 text-foreground">{title}</p>
        {description ? <p className="mt-1 text-small text-muted">{description}</p> : null}
      </div>
      {children}
    </fieldset>
  );
}
