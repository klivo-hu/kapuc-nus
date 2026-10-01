import type { ZodError } from 'zod';

/**
 * What an admin server action reports back to its form. `values` carries the submitted fields so
 * that, when React resets the form after the action, the inputs come back with what was typed
 * rather than the stale initial values.
 */
export interface FormState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
  readonly values?: Readonly<Record<string, string>>;
  /** Bumped on every result so the form can react even to an identical message. */
  readonly at?: number;
}

export const IDLE_STATE: FormState = { status: 'idle' };

/**
 * The text fields of a submission (files are never echoed back). Every entry is also recorded as
 * `name:value`, so a group of checkboxes sharing one name can restore each box.
 */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value !== 'string' || key.startsWith('$ACTION')) return;
    values[key] = value;
    values[`${key}:${value}`] = 'on';
  });
  return values;
}

export function successState(message = 'Mentve.', values?: Record<string, string>): FormState {
  return { status: 'success', message, values, at: Date.now() };
}

export function errorState(
  message: string,
  formData?: FormData,
  fieldErrors?: Record<string, string>,
): FormState {
  return {
    status: 'error',
    message,
    fieldErrors,
    values: formData ? formValues(formData) : undefined,
    at: Date.now(),
  };
}

/** Turns a validation failure into per-field messages keyed by the form field names. */
export function validationState(error: ZodError, formData: FormData): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return errorState('Néhány mezőt javítani kell.', formData, fieldErrors);
}
